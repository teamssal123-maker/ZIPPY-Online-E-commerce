import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.ts';
import { config } from '../src/config/index.ts';
import { resetDb } from '../src/store/db.ts';
import path from 'node:path';
import os from 'node:os';

const tmpFile = path.join(os.tmpdir(), `zippy-chat-test-${Date.now()}.json`);
(config as { dataFile: string }).dataFile = tmpFile;

const app = createApp();
let adminToken = '';

before(async () => {
  resetDb();
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@zippy.com.bd',
    password: 'admin123'
  });
  adminToken = loginRes.body.data.token;
});

after(() => {
  resetDb();
});

test('Live Chat: List seeded threads as Admin & Customer', async () => {
  // 1. Admin gets all threads
  const adminRes = await request(app)
    .get('/api/v1/chat/threads')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(adminRes.status, 200);
  assert.equal(adminRes.body.success, true);
  assert.ok(Array.isArray(adminRes.body.data));
  assert.ok(adminRes.body.data.length >= 2);

  // Parity /api/chat/threads
  const parityRes = await request(app)
    .get('/api/chat/threads')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(parityRes.status, 200);
  assert.equal(parityRes.body.data.length, adminRes.body.data.length);
});

test('Live Chat: Customer/Guest session creation and messaging flow', async () => {
  const guestKey = `guest-test-${Date.now()}`;

  // 1. Create a guest chat thread
  const createRes = await request(app)
    .post('/api/v1/chat/threads')
    .send({
      customerName: 'Asif Karim',
      customerPhone: '+880 1700-112233',
      subject: 'Custom Tuxedo Consultation',
      initialMessage: 'Do you have velvet dinner jackets available for bespoke tailoring?',
      guestKey
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.success, true);
  const thread = createRes.body.data.thread;
  assert.ok(thread.id);
  assert.equal(thread.customerName, 'Asif Karim');
  assert.ok(createRes.body.data.message);
  assert.ok(createRes.body.data.autoReply, 'Auto-concierge reply should be generated');

  // 2. Fetch thread messages
  const msgRes = await request(app).get(`/api/v1/chat/threads/${thread.id}/messages`);
  assert.equal(msgRes.status, 200);
  assert.ok(Array.isArray(msgRes.body.data));
  assert.ok(msgRes.body.data.length >= 3, 'Greeting + customer message + auto reply');

  // 3. Admin replies to the thread
  const replyRes = await request(app)
    .post(`/api/v1/chat/threads/${thread.id}/messages`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      message: 'Yes Mr. Karim, we have English velvet in Midnight Blue and Emerald Green.',
      senderRole: 'concierge',
      senderName: 'Atelier Concierge'
    });
  assert.equal(replyRes.status, 201);
  assert.equal(replyRes.body.data.message.senderRole, 'concierge');

  // 4. Mark read by customer
  const readRes = await request(app)
    .patch(`/api/v1/chat/threads/${thread.id}/read`)
    .send({ role: 'customer' });
  assert.equal(readRes.status, 200);
  assert.equal(readRes.body.data.unreadCountCustomer, 0);

  // 5. Admin AI draft suggestion
  const aiDraftRes = await request(app)
    .post(`/api/v1/chat/threads/${thread.id}/ai-draft`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(aiDraftRes.status, 200);
  assert.ok(aiDraftRes.body.data.draft);

  // 6. Update thread status
  const statusRes = await request(app)
    .patch(`/api/v1/chat/threads/${thread.id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'resolved' });
  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.data.status, 'resolved');

  // 7. Test AI Auto-Reply ON / OFF toggle
  // Get chat settings
  const settingsRes = await request(app).get('/api/v1/chat/settings');
  assert.equal(settingsRes.status, 200);
  assert.equal(typeof settingsRes.body.data.autoReply, 'boolean');

  // Turn AI Auto-Reply OFF
  const turnOffRes = await request(app)
    .patch('/api/v1/chat/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ autoReply: false });
  assert.equal(turnOffRes.status, 200);
  assert.equal(turnOffRes.body.data.autoReply, false);

  // Send customer message with auto-reply OFF: should NOT generate autoReply
  const msgWithoutAiRes = await request(app)
    .post(`/api/v1/chat/threads/${thread.id}/messages`)
    .send({
      message: 'Hello, I want to inquire about custom fabric swatches while AI is off.',
      senderRole: 'customer'
    });
  assert.equal(msgWithoutAiRes.status, 201);
  assert.equal(msgWithoutAiRes.body.data.autoReply, undefined, 'No auto-reply when AI auto-reply is disabled');

  // Turn AI Auto-Reply back ON
  const turnOnRes = await request(app)
    .patch('/api/v1/chat/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ autoReply: true });
  assert.equal(turnOnRes.status, 200);
  assert.equal(turnOnRes.body.data.autoReply, true);

  // Send customer message with auto-reply ON: should generate autoReply
  const msgWithAiRes = await request(app)
    .post(`/api/v1/chat/threads/${thread.id}/messages`)
    .send({
      message: 'Hello, can you help me with bespoke sizing and fitting?',
      senderRole: 'customer'
    });
  assert.equal(msgWithAiRes.status, 201);
  assert.ok(msgWithAiRes.body.data.autoReply, 'Auto-reply should be generated when enabled');
});

test('Live Chat: Customize replies, templates, keyword rules, and canned responses', async () => {
  // 1. Fetch initial chat settings
  const settingsRes = await request(app).get('/api/v1/chat/settings');
  assert.equal(settingsRes.status, 200);
  assert.ok(Array.isArray(settingsRes.body.data.cannedReplies));
  assert.ok(settingsRes.body.data.cannedReplies.length >= 4);
  assert.ok(Array.isArray(settingsRes.body.data.autoReplyRules));
  assert.ok(settingsRes.body.data.autoReplyRules.length >= 5);
  assert.ok(Array.isArray(settingsRes.body.data.instantInquiries));
  assert.ok(settingsRes.body.data.instantInquiries.length >= 4);

  // 2. Customize templates, add custom keyword rule for cufflinks, new canned reply, and new instant inquiry
  const customRule = {
    id: 'rule-cufflinks',
    name: 'Atelier Cufflinks & Accessories',
    keywords: ['cufflink', 'cufflinks', 'accessory', 'tie pin'],
    reply: 'Esteemed patron {name}, our hand-engraved sterling silver and 24K gold-plated cufflinks are available at our Gulshan 1 private lounge.',
    enabled: true
  };

  const customCanned = {
    id: 'canned-vip-swatch',
    label: 'VIP Fabric Swatches',
    text: 'We are pleased to courier our curated 2026 Italian Super 150s fabric swatch box directly to your residence.',
    category: 'Fabrics'
  };

  const customInquiry = {
    id: 'inquiry-wedding',
    label: '👔 Wedding Panjabi Collection',
    prompt: 'Could you please showcase your pure mulberry silk festive panjabis for grooms?',
    category: 'Occasion'
  };

  const patchRes = await request(app)
    .patch('/api/v1/chat/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      greetingMessage: 'Custom Greeting: Welcome to the private atelier of Zippy.',
      defaultAutoReply: 'Custom default auto-reply for {name}: Our head concierge is reviewing your request.',
      autoReplyRules: [customRule, ...settingsRes.body.data.autoReplyRules],
      cannedReplies: [customCanned, ...settingsRes.body.data.cannedReplies],
      instantInquiries: [customInquiry, ...settingsRes.body.data.instantInquiries]
    });

  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.data.greetingMessage, 'Custom Greeting: Welcome to the private atelier of Zippy.');
  assert.ok(patchRes.body.data.autoReplyRules.some((r: any) => r.id === 'rule-cufflinks'));
  assert.ok(patchRes.body.data.cannedReplies.some((c: any) => c.id === 'canned-vip-swatch'));
  assert.ok(patchRes.body.data.instantInquiries.some((i: any) => i.id === 'inquiry-wedding'));

  // 3. Create a thread for patron "Rahim Chowdhury" and test keyword rule trigger
  const threadRes = await request(app)
    .post('/api/v1/chat/threads')
    .send({
      customerName: 'Rahim Chowdhury',
      customerPhone: '+880 1711-998877',
      subject: 'Cufflinks Inquiry',
      initialMessage: 'Do you offer engraved cufflinks for groomsmen?'
    });

  assert.equal(threadRes.status, 201);
  const autoReply = threadRes.body.data.autoReply;
  assert.ok(autoReply, 'Auto-reply must be generated');
  // Check that {name} was personalized to Rahim Chowdhury and cufflinks rule matched
  assert.ok(
    autoReply.message.includes('Rahim Chowdhury'),
    `Expected personalized name in reply: ${autoReply.message}`
  );
  assert.ok(
    autoReply.message.includes('cufflinks are available at our Gulshan 1 private lounge'),
    `Expected matched rule content: ${autoReply.message}`
  );
});


