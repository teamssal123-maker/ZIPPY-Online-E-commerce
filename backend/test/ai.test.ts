import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.ts';
import { config } from '../src/config/index.ts';
import { resetDb } from '../src/store/db.ts';
import path from 'node:path';
import os from 'node:os';

const tmpFile = path.join(os.tmpdir(), `richman-ai-test-${Date.now()}.json`);
(config as { dataFile: string }).dataFile = tmpFile;

const app = createApp();
let adminToken = '';

before(async () => {
  resetDb();
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@richmanbd.com',
    password: 'admin123'
  });
  adminToken = loginRes.body.data.token;
});

after(() => {
  resetDb();
});

test('AI System: Status & Configuration Management', async () => {
  // 1. Status endpoint (public)
  const statusRes = await request(app).get('/api/v1/ai/status');
  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.success, true);
  assert.ok(statusRes.body.data.status);
  assert.ok(statusRes.body.data.provider);
  assert.ok(Array.isArray(statusRes.body.data.capabilities));
  assert.ok(statusRes.body.data.capabilities.length >= 5);
  assert.ok(Array.isArray(statusRes.body.data.supportedModels?.gemini));
  const hasGemini31Pro = statusRes.body.data.supportedModels.gemini.some((m: any) => m.id === 'gemini-3.1-pro');
  assert.equal(hasGemini31Pro, true);
  const hasGemini25Pro = statusRes.body.data.supportedModels.gemini.some((m: any) => m.id === 'gemini-2.5-pro');
  assert.equal(hasGemini25Pro, true);

  // Parity /api/ai/status
  const aliasStatus = await request(app).get('/api/ai/status');
  assert.equal(aliasStatus.status, 200);
  assert.equal(aliasStatus.body.data.provider, statusRes.body.data.provider);

  // 2. Get Settings (Admin only)
  const getSettingsRes = await request(app)
    .get('/api/v1/ai/settings')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(getSettingsRes.status, 200);
  assert.equal(getSettingsRes.body.data.enabled, true);

  // 3. Update Settings to Gemini Pinnacle Model (gemini-3.1-pro)
  const updateSettingsRes = await request(app)
    .put('/api/v1/ai/settings')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      provider: 'gemini',
      model: 'gemini-3.1-pro',
      temperature: 0.8,
      maxTokens: 4096,
      features: {
        stylistChat: true,
        productCopy: true
      }
    });
  assert.equal(updateSettingsRes.status, 200);
  assert.equal(updateSettingsRes.body.data.model, 'gemini-3.1-pro');
  assert.equal(updateSettingsRes.body.data.temperature, 0.8);
  assert.equal(updateSettingsRes.body.data.maxTokens, 4096);
});

test('AI System: Bespoke Stylist Chat & Concierge', async () => {
  // 1. General sartorial query
  const chatRes = await request(app)
    .post('/api/v1/ai/chat')
    .send({
      message: 'What should I wear to a winter wedding reception in Dhaka?',
      customerName: 'Tanvir',
      occasion: 'Wedding Reception'
    });

  assert.equal(chatRes.status, 200);
  assert.equal(chatRes.body.success, true);
  assert.ok(chatRes.body.data.reply);
  assert.ok(chatRes.body.data.reply.length > 50);
  assert.ok(Array.isArray(chatRes.body.data.suggestedProducts));
  assert.ok(Array.isArray(chatRes.body.data.suggestedQuestions));

  // Parity alias /api/ai/chat
  const aliasChat = await request(app)
    .post('/api/ai/chat')
    .send({
      message: 'How should I choose my blazer size?',
      customerName: 'Farhan'
    });
  assert.equal(aliasChat.status, 200);
  assert.ok(aliasChat.body.data.reply.toLowerCase().includes('size') || aliasChat.body.data.reply.toLowerCase().includes('fit') || aliasChat.body.data.reply.toLowerCase().includes('blazer'));
});

test('AI System: Smart Garment Recommendations', async () => {
  const recRes = await request(app)
    .post('/api/v1/ai/recommendations')
    .send({
      occasion: 'Executive Board Meeting',
      limit: 3
    });

  assert.equal(recRes.status, 200);
  assert.ok(Array.isArray(recRes.body.data.recommendations));
  assert.ok(recRes.body.data.recommendations.length > 0);
  assert.ok(recRes.body.data.recommendations[0].matchReason);
  assert.ok(recRes.body.data.recommendations[0].stylingTip);
});

test('AI System: Luxury Product Copy & SEO Generation', async () => {
  // 1. Product Copy
  const copyRes = await request(app)
    .post('/api/v1/ai/generate-product-copy')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Midnight Navy Italian Wool Blazer',
      category: 'Blazers',
      fabric: 'Super 140s Vitale Barberis Canonico Wool',
      fit: 'Structured European Modern Cut',
      occasion: 'Black-Tie Galas and Luxury Receptions'
    });

  assert.equal(copyRes.status, 200);
  assert.ok(copyRes.body.data.description);
  assert.ok(copyRes.body.data.shortDescription);
  assert.ok(Array.isArray(copyRes.body.data.highlights));
  assert.ok(copyRes.body.data.stylingNotes);
  assert.ok(copyRes.body.data.careInstructions);

  // 2. SEO Metadata
  const seoRes = await request(app)
    .post('/api/v1/ai/generate-seo')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Midnight Navy Italian Wool Blazer',
      category: 'Blazers',
      brand: 'RichMan Atelier'
    });

  assert.equal(seoRes.status, 200);
  assert.ok(seoRes.body.data.metaTitle);
  assert.ok(seoRes.body.data.metaDescription);
  assert.ok(seoRes.body.data.metaKeywords);
});

test('AI System: Inquiry Reply & Review Sentiment Analysis', async () => {
  // 1. Suggest Inquiry Reply
  const inquiryRes = await request(app)
    .post('/api/v1/ai/suggest-inquiry-reply')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      customerName: 'Mahmudur Rahman',
      customerEmail: 'mahmud@example.com',
      customerMessage: 'Can you customize the sleeve length and replace buttons with antique gold monogrammed buttons?',
      productName: 'Royal Velvet Wedding Sherwani',
      productPrice: 32000
    });

  assert.equal(inquiryRes.status, 200);
  assert.ok(inquiryRes.body.data.reply);
  assert.ok(inquiryRes.body.data.actionSuggestion);

  // 2. Review Sentiment Analysis (Positive)
  const reviewRes = await request(app)
    .post('/api/v1/ai/analyze-review')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      rating: 5,
      comment: 'Exceptional craftsmanship! The fit is immaculate and the wool feels remarkably soft.',
      authorName: 'Shahidul Alam',
      productName: 'Charcoal Herringbone Suit'
    });

  assert.equal(reviewRes.status, 200);
  assert.equal(reviewRes.body.data.sentiment, 'positive');
  assert.ok(reviewRes.body.data.score >= 0.8);
  assert.equal(reviewRes.body.data.requiresUrgentAttention, false);
  assert.ok(reviewRes.body.data.suggestedReply);

  // 3. Review Sentiment Analysis (Negative / Critical)
  const negReviewRes = await request(app)
    .post('/api/v1/ai/analyze-review')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      rating: 1,
      comment: 'The sleeves were too long and the package arrived later than promised.',
      authorName: 'Karim Ahmed',
      productName: 'Formal Shirt'
    });

  assert.equal(negReviewRes.status, 200);
  assert.equal(negReviewRes.body.data.sentiment, 'negative');
  assert.equal(negReviewRes.body.data.requiresUrgentAttention, true);
  assert.ok(negReviewRes.body.data.suggestedReply);
});

test('AI System: Autonomous Product Upload & Auto-Cataloging', async () => {
  // 1. Dry run preview
  const dryRunRes = await request(app)
    .post('/api/v1/ai/upload-product')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      prompt: 'Upload new product: Emerald Green Handloom Jamdani Panjabi, price 18500, sale price 16500, sizes 38, 40, 42, 44',
      dryRun: true
    });

  assert.equal(dryRunRes.status, 200);
  assert.equal(dryRunRes.body.data.dryRun, true);
  assert.ok(dryRunRes.body.data.product.name.toLowerCase().includes('jamdani') || dryRunRes.body.data.product.name.toLowerCase().includes('emerald'));
  assert.equal(dryRunRes.body.data.product.price, 18500);
  assert.equal(dryRunRes.body.data.product.salePrice, 16500);

  // 2. Real upload into catalog
  const uploadRes = await request(app)
    .post('/api/v1/ai/upload-product')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      prompt: 'Add a new product: Royal Velvet Midnight Sherwani with zardozi embroidery, price 35000 BDT, sale 32000, category Sherwani',
      dryRun: false
    });

  assert.equal(uploadRes.status, 201);
  assert.equal(uploadRes.body.data.dryRun, false);
  const createdProd = uploadRes.body.data.product;
  assert.ok(createdProd.id);
  assert.ok(createdProd.sku);
  assert.equal(createdProd.price, 35000);
  assert.equal(createdProd.salePrice, 32000);
  assert.equal(createdProd.onSale, true);
  assert.ok(createdProd.description.length > 50);

  // 3. Verify product is retrievable in public catalog
  const getProductRes = await request(app).get(`/api/v1/products/${createdProd.id}`);
  assert.equal(getProductRes.status, 200);
  assert.equal(getProductRes.body.data.id, createdProd.id);
});

test('AI System: Intelligent Product & Catalog Management', async () => {
  // 1. Update product price and sale discount
  const manageRes = await request(app)
    .post('/api/v1/ai/manage-product')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      command: 'Set price to 21000 and sale price to 18500 and restock size 40 to 25 for panjabi'
    });

  assert.equal(manageRes.status, 200);
  assert.equal(manageRes.body.data.success, true);
  assert.ok(manageRes.body.data.product);
  assert.equal(manageRes.body.data.product.price, 21000);
  assert.equal(manageRes.body.data.product.salePrice, 18500);
  assert.equal(manageRes.body.data.changes.price, 21000);
});

test('AI System: Storefront Content, Banner & Settings Automation', async () => {
  // 1. Update announcement bar
  const contentRes = await request(app)
    .post('/api/v1/ai/update-content')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      prompt: 'Update announcement bar to: "Private Tailoring & Fitting at Gulshan 1 Atelier | Free Delivery on Orders over ৳4,000"',
      target: 'announcement'
    });

  assert.equal(contentRes.status, 200);
  assert.equal(contentRes.body.data.target, 'announcement');
  assert.ok(contentRes.body.data.summary.includes('announcement banner'));

  // 2. Create hero promotional banner
  const bannerRes = await request(app)
    .post('/api/v1/ai/update-content')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      prompt: 'Create hero banner: "Bespoke Winter Gala 2026" with subtitle "Hand-finished pure cashmere overcoats & bespoke 3-piece suits"',
      target: 'banner'
    });

  assert.equal(bannerRes.status, 200);
  assert.equal(bannerRes.body.data.target, 'banner');
  assert.ok(bannerRes.body.data.updatedRecord.id);
  assert.ok(bannerRes.body.data.updatedRecord.title.includes('Bespoke Winter Gala'));
});

test('AI System: Universal Operations Command Dispatcher', async () => {
  // 1. Upload command through universal dispatcher
  const cmdUploadRes = await request(app)
    .post('/api/v1/ai/command')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      command: 'Upload new product: Signature White Luxury Tuxedo Shirt in Egyptian Giza Cotton, price 8500 BDT, sizes 39, 40, 42',
      dryRun: false
    });

  assert.equal(cmdUploadRes.status, 200);
  assert.equal(cmdUploadRes.body.data.actionType, 'product_upload');
  assert.ok(cmdUploadRes.body.data.result.id);
  assert.equal(cmdUploadRes.body.data.result.price, 8500);

  // 2. Content update command through universal dispatcher
  const cmdContentRes = await request(app)
    .post('/api/v1/ai/command')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      command: 'Update announcement bar to: "Gulshan 1 Atelier Private Consultations Open Daily 10 AM to 9 PM"',
      dryRun: false
    });

  assert.equal(cmdContentRes.status, 200);
  assert.equal(cmdContentRes.body.data.actionType, 'content_update');
  assert.ok(cmdContentRes.body.data.summary);
});
