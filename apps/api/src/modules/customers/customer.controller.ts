import type { Request, Response } from 'express';
import * as customerService from './customer.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const { search, cursor } = req.query as Record<string, string | undefined>;
  const result = await customerService.listCustomers(req.workspaceId!, { search, cursor });
  res.json({ data: result.data, pageInfo: { nextCursor: result.nextCursor, hasMore: result.nextCursor !== null } });
}

export async function get(req: Request, res: Response): Promise<void> {
  const result = await customerService.getCustomer(req.workspaceId!, req.params.customerId!);
  res.json({ data: result });
}
