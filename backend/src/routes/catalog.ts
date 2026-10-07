import { Router } from 'express';
import { z } from 'zod';
import {
  addReview,
  createProduct,
  deleteProduct,
  getProduct,
  listCategories,
  listProducts,
  listReviews,
  listStores,
  updateProduct
} from '../services/catalogService.ts';
import { requireAdmin } from '../middleware/auth.ts';
import { fail, ok } from '../utils/response.ts';
import { BANGLADESH_DIVISIONS } from '../data/catalog.ts';
import { createId } from '../utils/ids.ts';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  sku: z.string().min(2),
  styleCode: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string(),
  categoryName: z.string().optional(),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().nullable().optional(),
  costPrice: z.number().optional(),
  tax: z.number().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  fabric: z.string().optional(),
  fit: z.string().optional(),
  gender: z.string().optional(),
  images: z.array(z.string()).optional(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional(),
  sizes: z.array(z.string()).optional(),
  stock: z.record(z.number()).optional(),
  stockQuantity: z.number().optional(),
  lowStockThreshold: z.number().optional(),
  weight: z.number().optional(),
  dimensions: z.object({ length: z.number().optional(), width: z.number().optional(), height: z.number().optional() }).optional(),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  trending: z.boolean().optional(),
  onSale: z.boolean().optional(),
  isActive: z.boolean().optional(),
  status: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  careInstructions: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  customAttributes: z.record(z.string()).optional()
}).passthrough();

router.get('/categories', (_req, res) => {
  ok(res, listCategories());
});

router.get('/stores', (_req, res) => {
  ok(res, listStores());
});

router.get('/divisions', (_req, res) => {
  ok(res, BANGLADESH_DIVISIONS);
});

router.get('/products', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const featured = req.query.featured === 'true' ? true : undefined;
  const newArrival = req.query.newArrival === 'true' ? true : undefined;
  const onSale = req.query.onSale === 'true' ? true : undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const sort = req.query.sort as 'price_asc' | 'price_desc' | 'rating' | 'newest' | undefined;
  ok(res, listProducts({ q, category, featured, newArrival, onSale, minPrice, maxPrice, sort }));
});

router.get('/products/:id', (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) {
    fail(res, 'Product not found.', 404);
    return;
  }
  ok(res, product);
});

router.post('/products', requireAdmin, async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const product = await createProduct({
      name: body.name,
      slug: body.slug || '',
      sku: body.sku,
      styleCode: body.styleCode || `ST-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: body.categoryId,
      categoryName: body.categoryName || body.categoryId,
      price: body.price,
      salePrice: body.salePrice,
      description: body.description || 'Bespoke garment crafted with master tailoring techniques.',
      shortDescription: body.shortDescription || 'Premium hand-tailored construction.',
      fabric: body.fabric || 'Premium fabric',
      fit: body.fit || 'Tailored Fit',
      gender: 'Men',
      images: body.images || [],
      colors: body.colors || [{ name: 'Executive Navy', hex: '#1B2A4A' }],
      sizes: body.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      stock: body.stock || { S: 5, M: 8, L: 10, XL: 6, XXL: 4 },
      featured: body.featured ?? true,
      newArrival: body.newArrival ?? true,
      onSale: Boolean(body.salePrice && body.salePrice < body.price),
      rating: body.rating ?? 5,
      reviewCount: body.reviewCount ?? 0,
      careInstructions: body.careInstructions || ['Specialist dry clean only'],
      tags: body.tags || ['Tailored', 'New Season']
    });
    ok(res, product, 201);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = productSchema.partial().parse(req.body);
    const product = await updateProduct(req.params.id, body);
    if (!product) {
      fail(res, 'Product not found.', 404);
      return;
    }
    ok(res, product);
  } catch (err) {
    next(err);
  }
});

router.patch('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = productSchema.partial().parse(req.body);
    const product = await updateProduct(req.params.id, body);
    if (!product) {
      fail(res, 'Product not found.', 404);
      return;
    }
    ok(res, product);
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      fail(res, 'Product not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id/reviews', (req, res) => {
  ok(res, listReviews(req.params.id));
});

router.post('/products/:id/reviews', async (req, res, next) => {
  try {
    const schema = z.object({
      authorName: z.string().min(2),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(4)
    });
    const body = schema.parse(req.body);
    const product = getProduct(req.params.id);
    if (!product) {
      fail(res, 'Product not found.', 404);
      return;
    }
    const review = await addReview({
      id: createId('rev'),
      productId: product.id,
      authorName: body.authorName,
      rating: body.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      comment: body.comment,
      verifiedPurchase: true
    });
    ok(res, review, 201);
  } catch (err) {
    next(err);
  }
});

export default router;
