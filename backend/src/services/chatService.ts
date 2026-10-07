import { loadDb, mutateDb, DEFAULT_CHAT_SETTINGS } from '../store/db.ts';
import { createId } from '../utils/ids.ts';
import type {
  ChatMessage,
  ChatSenderRole,
  ChatThread,
  ChatThreadStatus,
  ChatSettings,
  ChatCannedReply,
  ChatAutoReplyRule
} from '../types/cms.ts';
import { chatWithStylist } from './aiService.ts';

function nowIso(): string {
  return new Date().toISOString();
}

export interface ListThreadsFilter {
  status?: string;
  search?: string;
  userId?: string;
  guestKey?: string;
}

export function listThreads(filter?: ListThreadsFilter): ChatThread[] {
  const db = loadDb();
  let threads = [...(db.chatThreads || [])];

  if (filter?.status && filter.status !== 'all') {
    threads = threads.filter((t) => t.status === filter.status);
  }

  if (filter?.userId) {
    threads = threads.filter((t) => t.userId === filter.userId);
  } else if (filter?.guestKey) {
    threads = threads.filter((t) => t.guestKey === filter.guestKey);
  }

  if (filter?.search?.trim()) {
    const q = filter.search.trim().toLowerCase();
    threads = threads.filter(
      (t) =>
        t.customerName?.toLowerCase().includes(q) ||
        t.customerEmail?.toLowerCase().includes(q) ||
        t.customerPhone?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.lastMessageText?.toLowerCase().includes(q)
    );
  }

  return threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getThread(id: string): ChatThread | undefined {
  const db = loadDb();
  return (db.chatThreads || []).find((t) => t.id === id);
}

export function isAiAutoReplyEnabled(db: any): boolean {
  if (db.settings?.aiSettings?.enabled === false) return false;
  if (db.settings?.aiSettings?.features?.chatAutoReply === false) return false;
  if (db.settings?.chatSettings?.autoReply === false) return false;
  return true;
}

export function getChatSettings(): ChatSettings {
  const db = loadDb();
  const base = db.settings?.chatSettings || DEFAULT_CHAT_SETTINGS;
  const aiEnabled = db.settings?.aiSettings?.enabled !== false;
  const featureEnabled = db.settings?.aiSettings?.features?.chatAutoReply !== false;
  const autoReply = aiEnabled && featureEnabled && base.autoReply !== false;

  return {
    ...DEFAULT_CHAT_SETTINGS,
    ...base,
    autoReply,
    enabled: aiEnabled && base.enabled !== false
  };
}

export async function updateChatSettings(input: Partial<ChatSettings>): Promise<ChatSettings> {
  return mutateDb((db) => {
    if (!db.settings) db.settings = {} as any;
    if (!db.settings.chatSettings) {
      db.settings.chatSettings = { ...DEFAULT_CHAT_SETTINGS };
    }
    if (!db.settings.aiSettings) {
      db.settings.aiSettings = {
        enabled: true,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        features: {
          stylistChat: true,
          productCopy: true,
          seoGeneration: true,
          inquiryAutoReply: true,
          reviewAnalysis: true,
          recommendations: true,
          chatAutoReply: true
        }
      } as any;
    }
    if (db.settings.aiSettings && !db.settings.aiSettings.features) {
      db.settings.aiSettings.features = {
        stylistChat: true,
        productCopy: true,
        seoGeneration: true,
        inquiryAutoReply: true,
        reviewAnalysis: true,
        recommendations: true,
        chatAutoReply: true
      };
    }

    if (typeof input.autoReply === 'boolean') {
      db.settings.chatSettings.autoReply = input.autoReply;
      if (db.settings.aiSettings?.features) {
        db.settings.aiSettings.features.chatAutoReply = input.autoReply;
      }
    }
    if (typeof input.enabled === 'boolean') {
      db.settings.chatSettings.enabled = input.enabled;
    }
    if (typeof input.greetingMessage === 'string') {
      db.settings.chatSettings.greetingMessage = input.greetingMessage;
    }
    if (typeof input.defaultAutoReply === 'string') {
      db.settings.chatSettings.defaultAutoReply = input.defaultAutoReply;
    }
    if (typeof input.offlineMessage === 'string') {
      db.settings.chatSettings.offlineMessage = input.offlineMessage;
    }
    if (typeof input.aiSystemPrompt === 'string') {
      db.settings.chatSettings.aiSystemPrompt = input.aiSystemPrompt;
    }
    if (Array.isArray(input.cannedReplies)) {
      db.settings.chatSettings.cannedReplies = input.cannedReplies;
    }
    if (Array.isArray(input.autoReplyRules)) {
      db.settings.chatSettings.autoReplyRules = input.autoReplyRules;
    }
    if (Array.isArray(input.instantInquiries)) {
      db.settings.chatSettings.instantInquiries = input.instantInquiries;
    }

    const aiEnabled = db.settings.aiSettings?.enabled !== false;
    const featureEnabled = db.settings.aiSettings?.features?.chatAutoReply !== false;
    const autoReply = aiEnabled && featureEnabled && db.settings.chatSettings.autoReply !== false;

    return {
      ...DEFAULT_CHAT_SETTINGS,
      ...db.settings.chatSettings,
      autoReply,
      enabled: aiEnabled && db.settings.chatSettings.enabled !== false
    };
  });
}

export function getThreadMessages(threadId: string): ChatMessage[] {
  const db = loadDb();
  return (db.chatMessages || [])
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function createOrGetThread(input: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;
  guestKey?: string;
  subject?: string;
  initialMessage?: string;
}): Promise<{ thread: ChatThread; message?: ChatMessage; autoReply?: ChatMessage }> {
  return mutateDb(async (db) => {
    if (!db.chatThreads) db.chatThreads = [];
    if (!db.chatMessages) db.chatMessages = [];

    // Find existing active thread for user or guest
    let thread = db.chatThreads.find((t) => {
      if (input.userId && t.userId === input.userId && t.status !== 'closed') return true;
      if (input.guestKey && t.guestKey === input.guestKey && t.status !== 'closed') return true;
      return false;
    });

    const ts = nowIso();
    let initialMsgRecord: ChatMessage | undefined;
    let autoReplyRecord: ChatMessage | undefined;

    if (!thread) {
      const threadId = createId('thread');
      thread = {
        id: threadId,
        customerName: input.customerName || (input.userId ? 'Valued Patron' : 'Guest Patron'),
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        userId: input.userId,
        guestKey: input.guestKey,
        status: 'active',
        subject: input.subject || 'Atelier Concierge Inquiry',
        lastMessageText: input.initialMessage || 'Session started with Zippy Concierge',
        lastMessageAt: ts,
        lastSenderRole: input.initialMessage ? 'customer' : 'concierge',
        unreadCountAdmin: input.initialMessage ? 1 : 0,
        unreadCountCustomer: 0,
        tags: ['Online Concierge'],
        createdAt: ts,
        updatedAt: ts
      };
      db.chatThreads.unshift(thread);

      // Add a greeting message from Concierge
      const greetingMsg: ChatMessage = {
        id: createId('msg'),
        threadId: thread.id,
        senderRole: 'concierge',
        senderName: 'Zippy Concierge',
        message: `Welcome to Zippy Gentleman's Atelier${input.customerName ? `, ${input.customerName}` : ''}. How may our sartorial team assist you with our bespoke tailoring, orders, or styling today?`,
        createdAt: new Date(Date.now() - 500).toISOString(),
        readAt: ts
      };
      db.chatMessages.push(greetingMsg);
    } else {
      // Update contact info if provided
      if (input.customerName) thread.customerName = input.customerName;
      if (input.customerEmail) thread.customerEmail = input.customerEmail;
      if (input.customerPhone) thread.customerPhone = input.customerPhone;
      thread.updatedAt = ts;
    }

    if (input.initialMessage?.trim()) {
      initialMsgRecord = {
        id: createId('msg'),
        threadId: thread.id,
        senderRole: 'customer',
        senderName: thread.customerName,
        senderId: input.userId,
        message: input.initialMessage.trim(),
        createdAt: ts,
        readAt: null
      };
      db.chatMessages.push(initialMsgRecord);
      thread.lastMessageText = initialMsgRecord.message;
      thread.lastMessageAt = ts;
      thread.lastSenderRole = 'customer';
      thread.unreadCountAdmin += 1;
      thread.status = 'waiting_admin';

      // Generate instant luxury concierge response if AI auto-reply is enabled
      if (isAiAutoReplyEnabled(db)) {
        const replyText = await generateLuxuryConciergeResponse(initialMsgRecord.message, thread.customerName);
        autoReplyRecord = {
          id: createId('msg'),
          threadId: thread.id,
          senderRole: 'concierge',
          senderName: 'Zippy Concierge',
          message: replyText,
          createdAt: new Date(Date.now() + 600).toISOString(),
          readAt: null
        };
        db.chatMessages.push(autoReplyRecord);
        thread.lastMessageText = autoReplyRecord.message;
        thread.lastMessageAt = autoReplyRecord.createdAt;
        thread.lastSenderRole = 'concierge';
        thread.unreadCountCustomer += 1;
      }
    }

    return { thread, message: initialMsgRecord, autoReply: autoReplyRecord };
  });
}

export async function sendChatMessage(input: {
  threadId: string;
  senderRole: ChatSenderRole;
  senderName: string;
  senderId?: string;
  message: string;
  attachments?: string[];
  metadata?: any;
  autoRespondAi?: boolean;
}): Promise<{ message: ChatMessage; thread: ChatThread; autoReply?: ChatMessage }> {
  return mutateDb(async (db) => {
    if (!db.chatThreads) db.chatThreads = [];
    if (!db.chatMessages) db.chatMessages = [];

    const thread = db.chatThreads.find((t) => t.id === input.threadId);
    if (!thread) {
      throw new Error(`Chat thread with ID ${input.threadId} not found.`);
    }

    const ts = nowIso();
    const msgId = createId('msg');
    const newMsg: ChatMessage = {
      id: msgId,
      threadId: thread.id,
      senderRole: input.senderRole,
      senderName: input.senderName,
      senderId: input.senderId,
      message: input.message.trim(),
      attachments: input.attachments || [],
      metadata: input.metadata,
      createdAt: ts,
      readAt: null
    };

    db.chatMessages.push(newMsg);

    thread.lastMessageText = newMsg.message;
    thread.lastMessageAt = ts;
    thread.lastSenderRole = input.senderRole;
    thread.updatedAt = ts;

    let autoReplyRecord: ChatMessage | undefined;

    if (input.senderRole === 'customer') {
      thread.unreadCountAdmin += 1;
      thread.status = 'waiting_admin';

      // Auto concierge response if requested and AI auto-reply is enabled
      const shouldAutoReply = isAiAutoReplyEnabled(db) && input.autoRespondAi !== false;
      if (shouldAutoReply) {
        const replyText = await generateLuxuryConciergeResponse(newMsg.message, thread.customerName);
        autoReplyRecord = {
          id: createId('msg'),
          threadId: thread.id,
          senderRole: 'concierge',
          senderName: 'Zippy Concierge',
          message: replyText,
          createdAt: new Date(Date.now() + 800).toISOString(),
          readAt: null
        };
        db.chatMessages.push(autoReplyRecord);
        thread.lastMessageText = autoReplyRecord.message;
        thread.lastMessageAt = autoReplyRecord.createdAt;
        thread.lastSenderRole = 'concierge';
        thread.unreadCountCustomer += 1;
      }
    } else {
      // Sent by admin or concierge
      thread.unreadCountCustomer += 1;
      thread.unreadCountAdmin = 0; // Admin replied, clear admin unread
      thread.status = 'waiting_customer';
    }

    return { message: newMsg, thread, autoReply: autoReplyRecord };
  });
}

export async function markThreadRead(threadId: string, role: 'admin' | 'customer'): Promise<ChatThread> {
  return mutateDb(async (db) => {
    const thread = (db.chatThreads || []).find((t) => t.id === threadId);
    if (!thread) throw new Error('Chat thread not found');

    const ts = nowIso();
    if (role === 'admin') {
      thread.unreadCountAdmin = 0;
      (db.chatMessages || [])
        .filter((m) => m.threadId === threadId && m.senderRole === 'customer' && !m.readAt)
        .forEach((m) => {
          m.readAt = ts;
        });
    } else {
      thread.unreadCountCustomer = 0;
      (db.chatMessages || [])
        .filter((m) => m.threadId === threadId && m.senderRole !== 'customer' && !m.readAt)
        .forEach((m) => {
          m.readAt = ts;
        });
    }

    thread.updatedAt = ts;
    return thread;
  });
}

export async function updateThreadStatus(
  threadId: string,
  status: ChatThreadStatus,
  assignedTo?: string
): Promise<ChatThread> {
  return mutateDb(async (db) => {
    const thread = (db.chatThreads || []).find((t) => t.id === threadId);
    if (!thread) throw new Error('Chat thread not found');

    thread.status = status;
    if (assignedTo !== undefined) thread.assignedTo = assignedTo;
    thread.updatedAt = nowIso();
    return thread;
  });
}

export async function deleteThread(threadId: string): Promise<boolean> {
  return mutateDb(async (db) => {
    const idx = (db.chatThreads || []).findIndex((t) => t.id === threadId);
    if (idx === -1) return false;

    db.chatThreads.splice(idx, 1);
    db.chatMessages = (db.chatMessages || []).filter((m) => m.threadId !== threadId);
    return true;
  });
}

export async function suggestReplyDraft(threadId: string): Promise<string> {
  const db = loadDb();
  const thread = (db.chatThreads || []).find((t) => t.id === threadId);
  if (!thread) throw new Error('Thread not found');

  const history = (db.chatMessages || [])
    .filter((m) => m.threadId === threadId)
    .slice(-6);

  const lastCustomerMsg = [...history].reverse().find((m) => m.senderRole === 'customer')?.message || thread.lastMessageText;

  try {
    const aiRes = await chatWithStylist({
      message: `As an elite concierge at Zippy Dhaka, suggest a warm, sophisticated and definitive response to this patron message: "${lastCustomerMsg}". Mention bespoke fitting, premium craftsmanship, or rapid Dhaka delivery where appropriate.`,
      customerName: thread.customerName
    });
    if (aiRes?.reply) {
      return aiRes.reply;
    }
  } catch {
    // Fallback below
  }

  return generateLuxuryConciergeResponse(lastCustomerMsg, thread.customerName);
}

// ----------------- Fallback & Domain-Aware Concierge Intelligence -----------------

async function generateLuxuryConciergeResponse(userMessage: string, customerName?: string): Promise<string> {
  const db = loadDb();
  const settings = db.settings?.chatSettings || DEFAULT_CHAT_SETTINGS;
  const msg = (userMessage || '').toLowerCase();
  const patron = customerName ? `${customerName}` : 'Esteemed Patron';

  // 1. Check custom auto-reply rules first
  const rules = settings.autoReplyRules || DEFAULT_CHAT_SETTINGS.autoReplyRules || [];
  for (const rule of rules) {
    if (rule.enabled !== false && Array.isArray(rule.keywords)) {
      const matched = rule.keywords.some((kw) => kw.trim() && msg.includes(kw.trim().toLowerCase()));
      if (matched && rule.reply?.trim()) {
        return rule.reply.replace(/\{name\}/gi, patron);
      }
    }
  }

  // 2. Custom default auto-reply template
  const defaultTemplate =
    settings.defaultAutoReply ||
    DEFAULT_CHAT_SETTINGS.defaultAutoReply ||
    `Thank you for contacting Zippy Gentleman's Atelier, {name}. A member of our concierge team has received your message and will review your request shortly. If your inquiry requires immediate priority, feel free to connect via WhatsApp at +880 1711-000001.`;

  return defaultTemplate.replace(/\{name\}/gi, patron);
}
