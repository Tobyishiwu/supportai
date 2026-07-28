import type { Request, Response } from 'express';
import * as publicChatService from './public-chat.service.js';
import { orchestrateReply } from '../ai/orchestration/chat-orchestrator.js';
import { getSocketServer, conversationRoom, broadcastToWorkspace } from '../../realtime/socket.js';
import { Message } from '../../models/message.model.js';
import { logger } from '../../config/logger.js';

export async function start(req: Request, res: Response): Promise<void> {
  const result = await publicChatService.startConversation(req.publicWorkspace!.id, req.body);
  broadcastToWorkspace(req.publicWorkspace!.id, 'conversation:created', {
    conversationId: result.conversationId,
  });
  res.status(201).json({ data: result });
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const { conversation, messages } = await publicChatService.getConversationHistory(
    req.publicWorkspace!.id,
    req.params.conversationId!,
  );
  res.json({ data: { conversation, messages } });
}

async function streamAIReply(workspaceId: string, conversationId: string): Promise<void> {
  const io = getSocketServer();
  const room = conversationRoom(conversationId);
  try {
    for await (const event of orchestrateReply(workspaceId, conversationId)) {
      if (event.type === 'delta') {
        io.to(room).emit('ai:delta', { delta: event.delta });
      } else {
        io.to(room).emit('ai:done', { confidence: event.confidence, needsHuman: event.needsHuman });
      }
    }

    const aiMessage = await Message.findOne({ conversation: conversationId, sender: 'ai' }).sort({ createdAt: -1 });
    if (aiMessage) {
      broadcastToWorkspace(workspaceId, 'message:created', { conversationId, message: aiMessage });
    }
  } catch (error) {
    logger.error({ err: error, conversationId }, 'AI reply generation failed');
    io.to(room).emit('ai:error', {
      message: "I'm having trouble responding right now. A support agent will follow up shortly.",
    });
  }
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const message = await publicChatService.saveCustomerMessage(
    req.publicWorkspace!.id,
    req.params.conversationId!,
    req.body.body,
  );

  res.status(201).json({ data: message });

  broadcastToWorkspace(req.publicWorkspace!.id, 'message:created', {
    conversationId: req.params.conversationId,
    message,
  });

  // Streamed asynchronously over the conversation's socket room; errors are
  // handled inside streamAIReply so they never reach the Express error
  // handler after the response has already been sent.
  void streamAIReply(req.publicWorkspace!.id, req.params.conversationId!);
}
