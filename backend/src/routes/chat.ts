import { Router } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/response.ts';
import { requireAdmin, type AuthedRequest } from '../middleware/auth.ts';
import {
  createOrGetThread,
  deleteThread,
  getChatSettings,
  getThread,
  getThreadMessages,
  listThreads,
  markThreadRead,
  sendChatMessage,
  suggestReplyDraft,
  updateChatSettings,
  updateThreadStatus
} from '../services/chatService.ts';

const router = Router();

// ----------------- Thread Discovery & Listing -----------------

router.get(['/', '/threads'], (req: AuthedRequest, res) => {
  const isAdmin = req.user?.role === 'ADMIN';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  if (isAdmin) {
    const threads = listThreads({ status, search });
    ok(res, threads);
    return;
  }

  // Customer or Guest scope
  const userId = req.user?.id;
  const guestKey = (req.query.guestKey as string) || req.guestKey;

  const threads = listThreads({
    status,
    search,
    userId,
    guestKey: userId ? undefined : guestKey
  });

  ok(res, threads);
});

// ----------------- Chat AI Auto-Reply Settings -----------------

router.get(['/settings', '/config'], (req, res) => {
  const settings = getChatSettings();
  ok(res, settings);
});

router.patch(['/settings', '/config'], requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      autoReply: z.boolean().optional(),
      enabled: z.boolean().optional(),
      greetingMessage: z.string().optional(),
      defaultAutoReply: z.string().optional(),
      offlineMessage: z.string().optional(),
      aiSystemPrompt: z.string().optional(),
      cannedReplies: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            text: z.string(),
            category: z.string().optional()
          })
        )
        .optional(),
      autoReplyRules: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            keywords: z.array(z.string()),
            reply: z.string(),
            enabled: z.boolean().default(true)
          })
        )
        .optional(),
      instantInquiries: z
        .array(
          z.object({
            id: z.string(),
            label: z.string().min(1),
            prompt: z.string().min(1),
            category: z.string().optional(),
            enabled: z.boolean().default(true)
          })
        )
        .optional()
    });
    const body = schema.parse(req.body);
    const updated = await updateChatSettings(body);
    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

// ----------------- Single Thread -----------------

router.get('/threads/:id', (req, res) => {
  const thread = getThread(req.params.id);
  if (!thread) {
    fail(res, 'Chat thread not found.', 404);
    return;
  }
  ok(res, thread);
});

// ----------------- Messages for a Thread -----------------

router.get('/threads/:id/messages', (req, res) => {
  const thread = getThread(req.params.id);
  if (!thread) {
    fail(res, 'Chat thread not found.', 404);
    return;
  }
  const messages = getThreadMessages(req.params.id);
  ok(res, messages);
});

// ----------------- Create or Initialize Thread -----------------

router.post(['/', '/threads'], async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      customerName: z.string().optional(),
      customerEmail: z.string().email().optional().or(z.literal('')),
      customerPhone: z.string().optional(),
      subject: z.string().optional(),
      initialMessage: z.string().optional(),
      guestKey: z.string().optional()
    });

    const body = schema.parse(req.body);
    const userId = req.user?.id;
    const guestKey = body.guestKey || req.guestKey || (!userId ? 'guest-' + Math.random().toString(36).slice(2, 10) : undefined);

    const customerName =
      body.customerName ||
      req.user?.fullName ||
      (req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Valued Patron');

    const result = await createOrGetThread({
      customerName,
      customerEmail: body.customerEmail || req.user?.email,
      customerPhone: body.customerPhone || req.user?.phone,
      userId,
      guestKey,
      subject: body.subject,
      initialMessage: body.initialMessage
    });

    ok(res, result, 201);
  } catch (err) {
    next(err);
  }
});

// ----------------- Send Message -----------------

router.post('/threads/:id/messages', async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      message: z.string().min(1, 'Message cannot be empty'),
      senderRole: z.enum(['customer', 'admin', 'concierge', 'ai']).optional(),
      senderName: z.string().optional(),
      attachments: z.array(z.string()).optional(),
      metadata: z.record(z.any()).optional(),
      autoRespondAi: z.boolean().optional()
    });

    const body = schema.parse(req.body);
    const isAdmin = req.user?.role === 'ADMIN';

    let senderRole = body.senderRole;
    if (!senderRole) {
      senderRole = isAdmin ? 'concierge' : 'customer';
    }

    let senderName = body.senderName;
    if (!senderName) {
      if (isAdmin) {
        senderName = req.user?.fullName || 'Zippy Concierge';
      } else {
        senderName = req.user?.fullName || 'Patron';
      }
    }

    const result = await sendChatMessage({
      threadId: req.params.id,
      senderRole,
      senderName,
      senderId: req.user?.id,
      message: body.message,
      attachments: body.attachments,
      metadata: body.metadata,
      autoRespondAi: isAdmin ? false : (body.autoRespondAi ?? true)
    });

    ok(res, result, 201);
  } catch (err) {
    next(err);
  }
});

// ----------------- Mark Thread Read -----------------

router.patch('/threads/:id/read', async (req: AuthedRequest, res, next) => {
  try {
    const roleParam = req.body?.role || (req.user?.role === 'ADMIN' ? 'admin' : 'customer');
    const updated = await markThreadRead(req.params.id, roleParam);
    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

// ----------------- Update Thread Status / Assignee -----------------

router.patch('/threads/:id/status', async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['active', 'waiting_admin', 'waiting_customer', 'resolved', 'closed']),
      assignedTo: z.string().optional()
    });
    const body = schema.parse(req.body);
    const updated = await updateThreadStatus(req.params.id, body.status, body.assignedTo);
    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

// ----------------- AI Smart Reply Draft -----------------

router.post('/threads/:id/ai-draft', async (req, res, next) => {
  try {
    const draft = await suggestReplyDraft(req.params.id);
    ok(res, { draft });
  } catch (err) {
    next(err);
  }
});

// ----------------- Delete Thread -----------------

router.delete('/threads/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteThread(req.params.id);
    if (!deleted) {
      fail(res, 'Thread not found', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
