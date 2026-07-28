import { Customer, type CustomerDoc } from '../../models/customer.model.js';
import { Conversation, type ConversationDoc } from '../../models/conversation.model.js';
import { AppError } from '../../common/errors/app-error.js';

const PAGE_SIZE = 20;

export async function listCustomers(
  workspaceId: string,
  filters: { search?: string; cursor?: string },
): Promise<{ data: CustomerDoc[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = { workspace: workspaceId };
  if (filters.search) {
    const pattern = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }
  if (filters.cursor) filter._id = { $lt: filters.cursor };

  const customers = await Customer.find(filter)
    .sort({ _id: -1 })
    .limit(PAGE_SIZE + 1);

  const hasMore = customers.length > PAGE_SIZE;
  const page = hasMore ? customers.slice(0, PAGE_SIZE) : customers;
  const last = page.at(-1);

  return { data: page, nextCursor: hasMore && last ? String(last._id) : null };
}

export async function getCustomer(
  workspaceId: string,
  customerId: string,
): Promise<{ customer: CustomerDoc; conversations: ConversationDoc[] }> {
  const customer = await Customer.findOne({ _id: customerId, workspace: workspaceId });
  if (!customer) throw AppError.notFound('Customer not found');

  const conversations = await Conversation.find({ customer: customerId, workspace: workspaceId })
    .populate('assignedTo', 'name email avatarUrl')
    .sort({ lastMessageAt: -1 });

  return { customer, conversations };
}
