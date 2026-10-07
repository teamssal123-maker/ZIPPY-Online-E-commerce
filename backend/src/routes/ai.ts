import { Router } from 'express';
import { z } from 'zod';
import { ok } from '../utils/response.ts';
import { requireAdmin, requirePermission, type AuthedRequest } from '../middleware/auth.ts';
import {
  aiManageProduct,
  aiUpdateContent,
  aiUploadProduct,
  analyzeReviewSentiment,
  chatWithStylist,
  executeAiAdminCommand,
  generateProductCopy,
  generateSeoMetadata,
  getAiSettings,
  getAiStatus,
  getSmartRecommendations,
  suggestInquiryReply,
  updateAiSettings
} from '../services/aiService.ts';

const router = Router();

function actor(req: AuthedRequest): string {
  return req.user?.id || req.authUser?.id || 'system';
}

// ----------------- Public / Customer Endpoints -----------------

// 1. Status & Active Capabilities
router.get('/status', (_req, res) => {
  ok(res, getAiStatus());
});

// 2. Bespoke AI Stylist Chat
router.post('/chat', async (req, res, next) => {
  try {
    const schema = z.object({
      message: z.string().min(1, 'Message is required'),
      history: z
        .array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string()
          })
        )
        .optional(),
      customerName: z.string().optional(),
      occasion: z.string().optional(),
      budget: z.number().optional()
    });
    const body = schema.parse(req.body);
    const result = await chatWithStylist(body);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

// 3. Smart Recommendations & Garment Pairing
router.post('/recommendations', async (req, res, next) => {
  try {
    const schema = z.object({
      productId: z.string().optional(),
      query: z.string().optional(),
      occasion: z.string().optional(),
      categoryId: z.string().optional(),
      limit: z.number().min(1).max(20).optional()
    });
    const body = schema.parse(req.body);
    const result = await getSmartRecommendations(body);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

// ----------------- Admin Operations -----------------

// 4. Get AI Settings
router.get('/settings', requireAdmin, requirePermission('settings.view'), (_req, res) => {
  ok(res, getAiSettings());
});

// 5. Update AI Settings
router.put('/settings', requireAdmin, requirePermission('settings.update'), async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      enabled: z.boolean().optional(),
      provider: z.enum(['gemini', 'openai', 'mock']).optional(),
      apiKey: z.string().optional(),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(64).max(8192).optional(),
      systemPrompt: z.string().optional(),
      features: z
        .object({
          stylistChat: z.boolean().optional(),
          productCopy: z.boolean().optional(),
          seoGeneration: z.boolean().optional(),
          inquiryAutoReply: z.boolean().optional(),
          reviewAnalysis: z.boolean().optional(),
          recommendations: z.boolean().optional(),
          chatAutoReply: z.boolean().optional()
        })
        .optional()
    });
    const body = schema.parse(req.body);
    const updated = await updateAiSettings(body, actor(req));
    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

// 6. Generate Luxury Product Copy
router.post(
  '/generate-product-copy',
  requireAdmin,
  requirePermission('products.create', 'products.update'),
  async (req, res, next) => {
    try {
      const schema = z.object({
        title: z.string().min(2, 'Product title is required'),
        category: z.string().optional(),
        fabric: z.string().optional(),
        fit: z.string().optional(),
        tone: z.string().optional(),
        occasion: z.string().optional(),
        keyFeatures: z.array(z.string()).optional()
      });
      const body = schema.parse(req.body);
      const copy = await generateProductCopy(body);
      ok(res, copy);
    } catch (err) {
      next(err);
    }
  }
);

// 7. Generate SEO Metadata
router.post(
  '/generate-seo',
  requireAdmin,
  requirePermission('products.update', 'seo.update'),
  async (req, res, next) => {
    try {
      const schema = z.object({
        title: z.string().min(2, 'Title is required'),
        category: z.string().optional(),
        description: z.string().optional(),
        brand: z.string().optional(),
        keywords: z.array(z.string()).optional()
      });
      const body = schema.parse(req.body);
      const seo = await generateSeoMetadata(body);
      ok(res, seo);
    } catch (err) {
      next(err);
    }
  }
);

// 8. Suggest Inquiry Reply
router.post(
  '/suggest-inquiry-reply',
  requireAdmin,
  requirePermission('inquiries.reply', 'inquiries.view'),
  async (req, res, next) => {
    try {
      const schema = z.object({
        inquiryId: z.string().optional(),
        customerName: z.string().optional(),
        customerEmail: z.string().optional(),
        customerMessage: z.string().min(1, 'Customer message is required'),
        productName: z.string().optional(),
        productPrice: z.number().optional()
      });
      const body = schema.parse(req.body);
      const reply = await suggestInquiryReply(body);
      ok(res, reply);
    } catch (err) {
      next(err);
    }
  }
);

// 9. Analyze Review Sentiment
router.post(
  '/analyze-review',
  requireAdmin,
  requirePermission('reviews.moderate', 'reviews.view'),
  async (req, res, next) => {
    try {
      const schema = z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().min(1, 'Review comment is required'),
        authorName: z.string().optional(),
        productName: z.string().optional()
      });
      const body = schema.parse(req.body);
      const analysis = await analyzeReviewSentiment(body);
      ok(res, analysis);
    } catch (err) {
      next(err);
    }
  }
);

// 10. AI Autonomous Product Uploader
router.post(
  '/upload-product',
  requireAdmin,
  requirePermission('products.create'),
  async (req: AuthedRequest, res, next) => {
    try {
      const schema = z.object({
        prompt: z.string().min(3, 'Product description or prompt is required'),
        overrides: z.record(z.any()).optional(),
        dryRun: z.boolean().optional()
      });
      const body = schema.parse(req.body);
      const result = await aiUploadProduct(body, actor(req));
      ok(res, result, result.dryRun ? 200 : 201);
    } catch (err) {
      next(err);
    }
  }
);

// 11. AI Catalog & Product Manager
router.post(
  '/manage-product',
  requireAdmin,
  requirePermission('products.update'),
  async (req: AuthedRequest, res, next) => {
    try {
      const schema = z.object({
        command: z.string().min(2, 'Management command is required'),
        productId: z.string().optional(),
        targetQuery: z.string().optional(),
        dryRun: z.boolean().optional()
      });
      const body = schema.parse(req.body);
      const result = await aiManageProduct(body, actor(req));
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// 12. AI Content & CMS Updater
router.post(
  '/update-content',
  requireAdmin,
  requirePermission('settings.update', 'banners.create', 'banners.update', 'pages.create', 'pages.update'),
  async (req: AuthedRequest, res, next) => {
    try {
      const schema = z.object({
        prompt: z.string().min(2, 'Content update prompt is required'),
        target: z.enum(['banner', 'announcement', 'page', 'settings', 'auto']).optional(),
        bannerId: z.string().optional(),
        pageSlug: z.string().optional(),
        dryRun: z.boolean().optional()
      });
      const body = schema.parse(req.body);
      const result = await aiUpdateContent(body, actor(req));
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// 13. Universal AI Operations Command Dispatcher
router.post('/command', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      command: z.string().min(2, 'Command is required'),
      dryRun: z.boolean().optional()
    });
    const body = schema.parse(req.body);
    const result = await executeAiAdminCommand(body, actor(req));
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;
