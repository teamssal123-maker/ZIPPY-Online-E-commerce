import { Router } from 'express';
import { z } from 'zod';
import { loadDb } from '../store/db.ts';
import { optionalAuth, ownerKey, requireAdmin, requireAuth, requirePermission, type AuthedRequest } from '../middleware/auth.ts';
import {
  confirmVerification,
  forgotPassword,
  login,
  logout,
  refreshSession,
  register,
  requestVerification,
  resetPassword,
  updateProfile
} from '../services/authService.ts';
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
import {
  addCoupon,
  addToCart,
  cancelOrder,
  cartSummary,
  clearCart,
  createOrder,
  deleteCoupon,
  deleteOrder,
  getCart,
  getOrder,
  getWishlist,
  listCoupons,
  listOrders,
  refundOrder,
  removeCartItem,
  returnOrder,
  toggleWishlist,
  updateCartItem,
  updateOrderStatus,
  validateCoupon
} from '../services/commerceService.ts';
import {
  addCustomerAddress,
  addMedia,
  addProductImage,
  addRedirect,
  adjustInventory,
  bulkUpdateProducts,
  cmsDashboard,
  createAdmin,
  createBanner,
  createBrand,
  createCategory,
  clearNotifications,
  createCustomerAdmin,
  createInquiry,
  createPage,
  createRole,
  createVariant,
  customersReport,
  deleteAdmin,
  deleteBanner,
  deleteBlog,
  deleteBrand,
  deleteCategory,
  deleteCustomer,
  deleteCustomerAddress,
  deleteHomepageSection,
  deleteInquiry,
  deleteMedia,
  deleteNotification,
  deleteOffer,
  deletePage,
  deleteRedirect,
  deleteReview,
  deleteRole,
  deleteShippingMethod,
  deleteVariant,
  deleteWarehouse,
  discountReport,
  duplicateProduct,
  exportCustomersReportCsv,
  exportDiscountCsv,
  exportInventoryReportCsv,
  exportOrdersCsv,
  exportOrdersReportCsv,
  exportPaymentCsv,
  exportProductSalesCsv,
  exportProductsCsv,
  exportProfitCsv,
  exportSalesReportCsv,
  exportShippingCsv,
  exportStockMovementCsv,
  generateInvoice,
  getAdmin,
  getAllPermissions,
  getBanner,
  getBlogPost,
  getBrand,
  getCategory,
  getCoupon,
  getCustomer,
  getCustomerOrders,
  getCustomerWishlist,
  getHomepageSection,
  getInquiry,
  getMedia,
  getNavigation,
  getOffer,
  getPage,
  getPayment,
  getReview,
  getRole,
  getSeo,
  getSettings,
  getShippingMethod,
  getVariant,
  getWarehouse,
  importProducts,
  inventoryHistory,
  inventoryReport,
  listAdmins,
  listAuditLogs,
  listBanners,
  listBlogPosts,
  listBrandProducts,
  listBrands,
  listCategoryProducts,
  listCustomerAddresses,
  listCustomers,
  listHomepage,
  listInquiries,
  listInventory,
  listInventoryTransactions,
  listMedia,
  listMediaFolders,
  listNotifications,
  listOffers,
  listPages,
  listPayments,
  listRedirects,
  listReviewsAdmin,
  listRoles,
  listShipping,
  listSubcategories,
  listVariants,
  listWarehouses,
  lowStock,
  markNotificationSent,
  moderateReview,
  ordersReport,
  outOfStock,
  paymentReport,
  productSalesReport,
  profitReport,
  publishBanner,
  publishBlogPost,
  publishPage,
  recordPayment,
  removeProductImage,
  reorderBanners,
  reorderBrands,
  reorderCategories,
  reorderHomepageSections,
  reorderProductImages,
  replyInquiry,
  salesReport,
  scheduleBlogPost,
  sendNotification,
  setBannerStatus,
  setDefaultCustomerAddress,
  setPrimaryProductImage,
  setProductStatus,
  shippingReport,
  sitemapXml,
  stockMovementReport,
  stockValuation,
  toggleBrandFeatured,
  toggleBrandVisibility,
  toggleCategoryVisibility,
  transferInventory,
  updateInventoryThresholds,
  updateAdmin,
  updateBanner,
  updateBrand,
  updateCategory,
  updateCoupon,
  updateCustomer,
  updateCustomerAddress,
  updateInquiryStatus,
  updateMedia,
  updateNavigation,
  updatePage,
  updatePaymentStatus,
  updateRole,
  updateSeo,
  updateSettings,
  updateVariant,
  upsertBlog,
  upsertHomepage,
  upsertOffer,
  upsertPaymentMethod,
  upsertShipping,
  upsertWarehouse,
  togglePaymentMethod,
  listPaymentMethods,
  getPaymentMethod,
  deletePaymentMethod,
  testGatewayConnection,
  getPaymentGatewayStats,
  initiateGatewayPayment,
  verifyGatewayPayment,
  processGatewayRefund,
  handleGatewayWebhook
} from '../services/cmsService.ts';
import { BANGLADESH_DIVISIONS } from '../data/catalog.ts';
import { fail, ok } from '../utils/response.ts';
import { createId } from '../utils/ids.ts';
import type { CartItem, OrderStatus, Product } from '../types/index.ts';

const router = Router();
const actor = (req: AuthedRequest) => req.user?.id;

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

function toProductPayload(body: z.infer<typeof productSchema>): Omit<Product, 'id'> {
  return {
    name: body.name,
    slug: body.slug || '',
    sku: body.sku,
    styleCode: body.styleCode || `ST-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: body.barcode,
    categoryId: body.categoryId,
    categoryName: body.categoryName || body.categoryId,
    subcategoryId: body.subcategoryId,
    brandId: body.brandId,
    price: body.price,
    salePrice: body.salePrice,
    costPrice: body.costPrice,
    tax: body.tax,
    description: body.description || 'Bespoke garment crafted with master tailoring techniques.',
    shortDescription: body.shortDescription || 'Premium hand-tailored construction.',
    fabric: body.fabric || 'Premium fabric',
    fit: body.fit || 'Tailored Fit',
    gender: 'Men',
    images: body.images || [],
    colors: body.colors || [{ name: 'Executive Navy', hex: '#1B2A4A' }],
    sizes: body.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
    stock: body.stock || { S: 5, M: 8, L: 10, XL: 6, XXL: 4 },
    stockQuantity: body.stockQuantity,
    lowStockThreshold: body.lowStockThreshold ?? 8,
    weight: body.weight,
    dimensions: body.dimensions,
    featured: body.featured ?? true,
    newArrival: body.newArrival ?? true,
    bestSeller: body.bestSeller,
    trending: body.trending,
    onSale: Boolean(body.salePrice && body.salePrice < body.price),
    isActive: body.isActive ?? true,
    status: body.status || 'published',
    rating: body.rating ?? 5,
    reviewCount: body.reviewCount ?? 0,
    careInstructions: body.careInstructions || ['Specialist dry clean only'],
    tags: body.tags || ['Tailored', 'New Season'],
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
    metaKeywords: body.metaKeywords,
    customAttributes: body.customAttributes
  };
}

router.get('/health', (_req, res) => {
  ok(res, { status: 'ok', service: 'zippy-api', version: 'v1', time: new Date().toISOString() });
});

router.post('/auth/register', async (req, res, next) => {
  try {
    const body = z
      .object({
        fullName: z.string().min(2).optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email(),
        phone: z.string().min(8),
        password: z.string().min(6)
      })
      .parse(req.body);
    const fullName = body.fullName || [body.first_name, body.last_name].filter(Boolean).join(' ');
    ok(res, await register({ fullName, email: body.email, phone: body.phone, password: body.password }), 201);
  } catch (err) {
    next(err);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    ok(res, await login(body.email, body.password));
  } catch (err) {
    next(err);
  }
});

router.post('/auth/logout', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string().optional() }).parse(req.body || {});
    ok(res, await logout(body.refreshToken, req.user?.id));
  } catch (err) {
    next(err);
  }
});

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string().min(10) }).parse(req.body);
    ok(res, await refreshSession(body.refreshToken));
  } catch (err) {
    next(err);
  }
});

router.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    ok(res, await forgotPassword(body.email));
  } catch (err) {
    next(err);
  }
});

router.post('/auth/reset-password', async (req, res, next) => {
  try {
    const body = z.object({ token: z.string().min(8), password: z.string().min(6) }).parse(req.body);
    ok(res, await resetPassword(body.token, body.password));
  } catch (err) {
    next(err);
  }
});

router.post('/auth/verify/request', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ type: z.enum(['email', 'phone']) }).parse(req.body);
    ok(res, await requestVerification(req.user!.id, body.type));
  } catch (err) {
    next(err);
  }
});

router.post('/auth/verify/confirm', async (req, res, next) => {
  try {
    const body = z.object({ token: z.string(), type: z.enum(['email', 'phone']) }).parse(req.body);
    ok(res, await confirmVerification(body.token, body.type));
  } catch (err) {
    next(err);
  }
});

router.get('/auth/me', optionalAuth, (req: AuthedRequest, res) => {
  if (!req.user) {
    fail(res, 'Not authenticated.', 401);
    return;
  }
  ok(res, req.user);
});

router.patch('/auth/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      fullName: z.string().min(2).optional(),
      phone: z.string().min(8).optional(),
      profileImage: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.string().optional(),
      savedAddresses: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            address: z.string(),
            division: z.string(),
            district: z.string(),
            phone: z.string(),
            isDefault: z.boolean(),
            name: z.string().optional(),
            city: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
            addressType: z.string().optional()
          })
        )
        .optional()
    });
    ok(res, await updateProfile(req.user!.id, schema.parse(req.body)));
  } catch (err) {
    next(err);
  }
});

router.get('/categories', (_req, res) => ok(res, listCategories()));
router.get('/categories/:id', (req, res) => {
  const cat = getCategory(req.params.id);
  if (!cat) {
    fail(res, 'Category not found.', 404);
    return;
  }
  ok(res, cat);
});
router.get('/categories/:id/products', (req, res) => {
  ok(res, listCategoryProducts(req.params.id));
});
router.get('/categories/:id/subcategories', (req, res) => {
  ok(res, listSubcategories(req.params.id));
});
router.patch('/categories/:id/visibility', requireAdmin, requirePermission('categories.update'), async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ active: z.boolean().optional() }).parse(req.body || {});
    ok(res, await toggleCategoryVisibility(req.params.id, body.active, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/categories', requireAdmin, requirePermission('categories.create'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await createCategory(req.body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/categories/:id', requireAdmin, requirePermission('categories.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateCategory(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/categories/:id', requireAdmin, requirePermission('categories.delete'), async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteCategory(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Category not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});
router.post('/categories/reorder', requireAdmin, requirePermission('categories.update'), async (req, res, next) => {
  try {
    const body = z.object({ ids: z.array(z.string()) }).parse(req.body);
    ok(res, await reorderCategories(body.ids));
  } catch (err) {
    next(err);
  }
});

router.get('/brands', (_req, res) => ok(res, listBrands()));
router.get('/brands/:id', (req, res) => {
  const brand = getBrand(req.params.id);
  if (!brand) {
    fail(res, 'Brand not found.', 404);
    return;
  }
  ok(res, brand);
});
router.get('/brands/:id/products', (req, res) => {
  ok(res, listBrandProducts(req.params.id));
});
router.patch('/brands/:id/visibility', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ active: z.boolean().optional() }).parse(req.body || {});
    ok(res, await toggleBrandVisibility(req.params.id, body.active, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.patch('/brands/:id/featured', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ featured: z.boolean().optional() }).parse(req.body || {});
    ok(res, await toggleBrandFeatured(req.params.id, body.featured, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/brands/reorder', requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ ids: z.array(z.string()) }).parse(req.body);
    ok(res, await reorderBrands(body.ids));
  } catch (err) {
    next(err);
  }
});
router.post('/brands', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await createBrand(req.body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/brands/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateBrand(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/brands/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteBrand(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Brand not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/stores', (_req, res) => ok(res, listStores()));
router.get('/divisions', (_req, res) => ok(res, BANGLADESH_DIVISIONS));

router.get('/products/export', requireAdmin, requirePermission('products.view', 'reports.export'), (_req, res) => {
  const csv = exportProductsCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.send(csv);
});

router.post('/products/import', requireAdmin, requirePermission('products.create'), async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ products: z.array(productSchema) }).parse(req.body);
    ok(res, await importProducts(body.products, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});

router.post('/products/bulk-update', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      ids: z.array(z.string().min(1)),
      updates: productSchema.partial()
    });
    const body = schema.parse(req.body);
    ok(res, await bulkUpdateProducts(body.ids, body.updates, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.get('/products', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const subcategoryId = typeof req.query.subcategoryId === 'string' ? req.query.subcategoryId : undefined;
  const brand = typeof req.query.brand === 'string' ? req.query.brand : undefined;
  const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : undefined;
  const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
  const newArrival = req.query.newArrival === 'true' ? true : req.query.newArrival === 'false' ? false : undefined;
  const bestSeller = req.query.bestSeller === 'true' ? true : req.query.bestSeller === 'false' ? false : undefined;
  const trending = req.query.trending === 'true' ? true : req.query.trending === 'false' ? false : undefined;
  const onSale = req.query.onSale === 'true' ? true : req.query.onSale === 'false' ? false : undefined;
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const sku = typeof req.query.sku === 'string' ? req.query.sku : undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const sort = req.query.sort as 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'bestseller' | undefined;
  ok(res, listProducts({ q, category, categoryId, subcategoryId, brand, brandId, featured, newArrival, bestSeller, trending, onSale, isActive, status, sku, minPrice, maxPrice, sort }));
});

router.get('/products/:id', (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) {
    fail(res, 'Product not found.', 404);
    return;
  }
  ok(res, product);
});

router.post('/products', requireAdmin, requirePermission('products.create'), async (req: AuthedRequest, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    ok(res, await createProduct(toProductPayload(body)), 201);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', requireAdmin, requirePermission('products.update'), async (req, res, next) => {
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

router.patch('/products/:id', requireAdmin, requirePermission('products.update'), async (req, res, next) => {
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

router.delete('/products/:id', requireAdmin, requirePermission('products.delete'), async (req, res, next) => {
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

router.post('/products/:id/duplicate', requireAdmin, requirePermission('products.create'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await duplicateProduct(req.params.id, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/publish', requireAdmin, requirePermission('products.publish'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await setProductStatus(req.params.id, 'published', actor(req)));
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/unpublish', requireAdmin, requirePermission('products.publish'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await setProductStatus(req.params.id, 'draft', actor(req)));
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/images', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    if (Array.isArray(req.body?.images)) {
      const results = [];
      for (const item of req.body.images) {
        results.push(await addProductImage(req.params.id, item.url, item.altText, actor(req)));
      }
      ok(res, results, 201);
      return;
    }
    const body = z.object({ url: z.string().min(4), altText: z.string().optional() }).parse(req.body);
    ok(res, await addProductImage(req.params.id, body.url, body.altText, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id/images/:imageId/primary', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await setPrimaryProductImage(req.params.id, req.params.imageId, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.post('/products/:id/images/reorder', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ imageIds: z.array(z.string()) }).parse(req.body);
    ok(res, await reorderProductImages(req.params.id, body.imageIds, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id/images/:imageId', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await removeProductImage(req.params.id, req.params.imageId, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id/variants', (req, res) => {
  ok(res, listVariants(req.params.id));
});

router.post('/products/:id/variants', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      variantName: z.string().min(1),
      sku: z.string().optional(),
      price: z.number().positive().optional(),
      salePrice: z.number().positive().optional(),
      stockQuantity: z.number().int().nonnegative().optional(),
      image: z.string().optional(),
      status: z.enum(['active', 'inactive', 'draft', 'published', 'archived']).optional()
    });
    const body = schema.parse(req.body);
    ok(res, await createVariant(req.params.id, body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});

router.get('/variants/:variantId', (req, res) => {
  const variant = getVariant(req.params.variantId);
  if (!variant) {
    fail(res, 'Variant not found.', 404);
    return;
  }
  ok(res, variant);
});

router.put('/variants/:variantId', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateVariant(req.params.variantId, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.delete('/variants/:variantId', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteVariant(req.params.variantId, actor(req));
    if (!deleted) {
      fail(res, 'Variant not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id/reviews', (req, res) => ok(res, listReviews(req.params.id)));
router.post('/products/:id/reviews', async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      authorName: z.string().min(2).optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(3),
      title: z.string().optional()
    });
    const body = schema.parse(req.body);
    const product = getProduct(req.params.id);
    if (!product) {
      fail(res, 'Product not found.', 404);
      return;
    }
    const authorName = body.authorName || req.user?.firstName || req.user?.fullName?.split(' ')[0] || 'Verified Buyer';
    const review = await addReview({
      id: createId('rev'),
      productId: product.id,
      authorName,
      rating: body.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      comment: body.comment,
      title: body.title,
      verifiedPurchase: true,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    ok(res, review, 201);
  } catch (err) {
    next(err);
  }
});

router.get('/inventory', requireAdmin, requirePermission('inventory.view'), (_req, res) => ok(res, listInventory()));
router.get('/inventory/low-stock', requireAdmin, requirePermission('inventory.view'), (_req, res) => ok(res, lowStock()));
router.get('/inventory/out-of-stock', requireAdmin, requirePermission('inventory.view'), (_req, res) => ok(res, outOfStock()));
router.get('/inventory/valuation', requireAdmin, requirePermission('inventory.view'), (_req, res) => ok(res, stockValuation()));
router.get('/inventory/history', requireAdmin, requirePermission('inventory.view'), (req, res) => {
  const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
  ok(res, inventoryHistory(productId));
});
router.get('/inventory/transactions', requireAdmin, requirePermission('inventory.view'), (req, res) => {
  const type = typeof req.query.type === 'string' ? req.query.type : undefined;
  const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
  const warehouseId = typeof req.query.warehouseId === 'string' ? req.query.warehouseId : undefined;
  ok(res, listInventoryTransactions({ type, productId, warehouseId }));
});

const stockSchema = z.object({
  productId: z.string(),
  warehouseId: z.string().optional(),
  quantity: z.number(),
  note: z.string().optional(),
  reference: z.string().optional(),
  variantId: z.string().optional()
});

router.post('/inventory/adjust', requireAdmin, requirePermission('inventory.stock_adjustment'), async (req: AuthedRequest, res, next) => {
  try {
    const body = stockSchema.parse(req.body);
    ok(res, await adjustInventory({ ...body, type: 'adjustment', userId: actor(req) }));
  } catch (err) {
    next(err);
  }
});
router.post('/inventory/stock-in', requireAdmin, requirePermission('inventory.update'), async (req: AuthedRequest, res, next) => {
  try {
    const body = stockSchema.parse(req.body);
    ok(res, await adjustInventory({ ...body, type: 'stock_in', userId: actor(req) }), 201);
  } catch (err) {
    next(err);
  }
});
router.post('/inventory/stock-out', requireAdmin, requirePermission('inventory.update'), async (req: AuthedRequest, res, next) => {
  try {
    const body = stockSchema.parse(req.body);
    ok(res, await adjustInventory({ ...body, type: 'stock_out', userId: actor(req) }), 201);
  } catch (err) {
    next(err);
  }
});
router.post('/inventory/purchase', requireAdmin, requirePermission('inventory.update'), async (req: AuthedRequest, res, next) => {
  try {
    const body = stockSchema.parse(req.body);
    ok(res, await adjustInventory({ ...body, type: 'purchase', userId: actor(req) }), 201);
  } catch (err) {
    next(err);
  }
});
router.post('/inventory/transfer', requireAdmin, requirePermission('inventory.stock_adjustment'), async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      fromWarehouseId: z.string(),
      toWarehouseId: z.string(),
      quantity: z.number().positive(),
      note: z.string().optional(),
      reference: z.string().optional()
    });
    const body = schema.parse(req.body);
    ok(res, await transferInventory({ ...body, userId: actor(req) }));
  } catch (err) {
    next(err);
  }
});

router.post('/inventory/threshold', requireAdmin, requirePermission('inventory.update'), async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      warehouseId: z.string().optional(),
      minimumStock: z.number().min(0),
      maximumStock: z.number().min(0).optional()
    });
    const body = schema.parse(req.body);
    ok(res, await updateInventoryThresholds({ ...body, userId: actor(req) }));
  } catch (err) {
    next(err);
  }
});

router.get('/inventory/export', requireAdmin, requirePermission('inventory.view'), (_req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory_report.csv"');
  res.send(exportInventoryReportCsv());
});

router.get('/warehouses', requireAdmin, (_req, res) => ok(res, listWarehouses()));
router.get('/warehouses/:id', requireAdmin, (req, res) => {
  const wh = getWarehouse(req.params.id);
  if (!wh) {
    fail(res, 'Warehouse not found.', 404);
    return;
  }
  ok(res, wh);
});
router.post('/warehouses', requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ name: z.string(), code: z.string().optional(), address: z.string().optional(), phone: z.string().optional(), manager: z.string().optional() }).parse(req.body);
    ok(res, await upsertWarehouse(body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/warehouses/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertWarehouse({ name: req.body.name, ...req.body }, req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/warehouses/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteWarehouse(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Warehouse not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/banners', (req, res) => ok(res, listBanners(req.query.active === 'true')));
router.get('/banners/:id', (req, res) => {
  const banner = getBanner(req.params.id);
  if (!banner) {
    fail(res, 'Banner not found.', 404);
    return;
  }
  ok(res, banner);
});
router.post('/banners', requireAdmin, requirePermission('banners.create'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await createBanner(req.body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/banners/:id', requireAdmin, requirePermission('banners.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateBanner(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.patch('/banners/:id', requireAdmin, requirePermission('banners.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateBanner(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/banners/:id', requireAdmin, requirePermission('banners.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateBanner(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.put('/banners/:id/status', requireAdmin, requirePermission('banners.publish'), async (req: AuthedRequest, res, next) => {
  try {
    const status = req.body?.status || 'active';
    ok(res, await updateBanner(req.params.id, { status }, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.patch('/banners/:id/status', requireAdmin, requirePermission('banners.publish'), async (req: AuthedRequest, res, next) => {
  try {
    const status = req.body?.status || 'active';
    ok(res, await updateBanner(req.params.id, { status }, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/banners/:id', requireAdmin, requirePermission('banners.delete'), async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteBanner(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Banner not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});
router.post('/banners/:id/publish', requireAdmin, requirePermission('banners.publish'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await publishBanner(req.params.id, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/banners/:id/activate', requireAdmin, requirePermission('banners.publish'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await setBannerStatus(req.params.id, 'active', actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/banners/:id/deactivate', requireAdmin, requirePermission('banners.publish'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await setBannerStatus(req.params.id, 'inactive', actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/banners/reorder', requireAdmin, requirePermission('banners.update'), async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ ids: z.array(z.string()) }).parse(req.body);
    ok(res, await reorderBanners(body.ids, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.get('/homepage-sections', (_req, res) => ok(res, listHomepage()));
router.get('/homepage-sections/:id', (req, res) => {
  const section = getHomepageSection(req.params.id);
  if (!section) {
    fail(res, 'Section not found.', 404);
    return;
  }
  ok(res, section);
});
router.post('/homepage-sections', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertHomepage(req.body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/homepage-sections/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertHomepage(req.body, req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/homepage-sections/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteHomepageSection(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Section not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});
router.post('/homepage-sections/reorder', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ ids: z.array(z.string()) }).parse(req.body);
    ok(res, await reorderHomepageSections(body.ids, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.get('/navigation', (_req, res) => ok(res, getNavigation()));
router.put('/navigation', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await updateNavigation(req.body.menus || req.body));
  } catch (err) {
    next(err);
  }
});

router.get('/cart', optionalAuth, (req: AuthedRequest, res) => {
  const items = getCart(ownerKey(req));
  const location = req.query.location === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';
  const couponCode = typeof req.query.coupon === 'string' ? req.query.coupon : undefined;
  const coupon = couponCode ? validateCoupon(couponCode, cartSummary(items, location).subtotal).coupon : null;
  ok(res, cartSummary(items, location, coupon));
});
router.post('/cart/items', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']),
      color: z.object({ name: z.string(), hex: z.string() }),
      quantity: z.number().int().positive().optional()
    });
    const body = schema.parse(req.body);
    ok(res, await addToCart(ownerKey(req), body.productId, body.size, body.color, body.quantity ?? 1), 201);
  } catch (err) {
    next(err);
  }
});
router.patch('/cart/items/:id', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ quantity: z.number().int() }).parse(req.body);
    ok(res, await updateCartItem(ownerKey(req), req.params.id, body.quantity));
  } catch (err) {
    next(err);
  }
});
router.delete('/cart/items/:id', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await removeCartItem(ownerKey(req), req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/cart', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    await clearCart(ownerKey(req));
    ok(res, { cleared: true });
  } catch (err) {
    next(err);
  }
});

// POST /cart/add alias — storefront compat
router.post('/cart/add', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      size: z.string().optional(),
      color: z.object({ name: z.string(), hex: z.string() }).optional(),
      quantity: z.number().int().positive().optional()
    });
    const body = schema.parse(req.body);
    const sizeVal = (body.size as any) || 'M';
    const colorVal = body.color || { name: 'Default', hex: '#1B2A4A' };
    ok(res, await addToCart(ownerKey(req), body.productId, sizeVal, colorVal, body.quantity ?? 1), 201);
  } catch (err) {
    next(err);
  }
});

router.get('/wishlist', optionalAuth, (req: AuthedRequest, res) => ok(res, getWishlist(ownerKey(req))));
router.post('/wishlist/:productId', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await toggleWishlist(ownerKey(req), req.params.productId));
  } catch (err) {
    next(err);
  }
});
// POST /wishlist/toggle — storefront compat (body: { productId })
router.post('/wishlist/toggle', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { productId } = z.object({ productId: z.string() }).parse(req.body);
    ok(res, await toggleWishlist(ownerKey(req), productId));
  } catch (err) {
    next(err);
  }
});

router.get('/coupons', (_req, res) => ok(res, listCoupons()));
router.get('/coupons/:code', (req, res) => {
  const coupon = getCoupon(req.params.code);
  if (!coupon) {
    fail(res, 'Coupon not found.', 404);
    return;
  }
  ok(res, coupon);
});
router.put('/coupons/:code', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await updateCoupon(req.params.code, req.body));
  } catch (err) {
    next(err);
  }
});
router.post('/coupons/validate', (req, res, next) => {
  try {
    const body = z.object({ code: z.string().min(2), subtotal: z.number().nonnegative() }).parse(req.body);
    ok(res, validateCoupon(body.code, body.subtotal));
  } catch (err) {
    next(err);
  }
});
router.post('/coupons', requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      code: z.string().min(2),
      discountPercent: z.number().optional(),
      discountAmount: z.number().optional(),
      discountType: z.enum(['percent', 'fixed']).optional(),
      discountValue: z.number().optional(),
      minSpend: z.number().optional(),
      minOrder: z.number().nonnegative(),
      description: z.string(),
      expiresAt: z.string().optional()
    });
    const body = schema.parse(req.body);
    ok(res, await addCoupon({ ...body, code: body.code.trim().toUpperCase(), minSpend: body.minSpend ?? body.minOrder }), 201);
  } catch (err) {
    next(err);
  }
});
router.delete('/coupons/:code', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteCoupon(req.params.code);
    if (!deleted) {
      fail(res, 'Coupon not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/offers', (_req, res) => ok(res, listOffers()));
router.get('/offers/:id', (req, res) => {
  const offer = getOffer(req.params.id);
  if (!offer) {
    fail(res, 'Offer not found.', 404);
    return;
  }
  ok(res, offer);
});
router.post('/offers', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertOffer(req.body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/offers/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertOffer(req.body, req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/offers/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, { deleted: await deleteOffer(req.params.id) });
  } catch (err) {
    next(err);
  }
});

const customerSchema = z.object({
  fullName: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8),
  division: z.string().min(2).optional().default('Dhaka'),
  district: z.string().min(2).optional().default('Dhaka'),
  city: z.string().optional(),
  address: z.string().min(4),
  shippingAddress: z.any().optional(),
  deliveryNotes: z.string().optional(),
  notes: z.string().optional()
}).transform(d => ({
  fullName: d.fullName || d.name || 'Customer',
  email: d.email || 'customer@store.com',
  phone: d.phone,
  division: d.division || d.city || 'Dhaka',
  district: d.district || d.city || 'Dhaka',
  address: d.address,
  deliveryNotes: d.deliveryNotes || d.notes
}));

router.post('/checkout', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      customer: customerSchema,
      paymentMethod: z.string().min(2),
      paymentId: z.string().optional(),
      couponCode: z.string().optional(),
      shippingLocation: z.enum(['inside_dhaka', 'outside_dhaka']).default('inside_dhaka'),
      items: z
        .array(
          z.object({
            id: z.string(),
            productId: z.string(),
            product: z.any(),
            size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']),
            color: z.object({ name: z.string(), hex: z.string() }),
            quantity: z.number().int().positive(),
            price: z.number().nonnegative()
          })
        )
        .optional()
    });
    const body = schema.parse(req.body);
    const order = await createOrder({
      ownerKey: ownerKey(req),
      customer: body.customer,
      paymentMethod: body.paymentMethod as any,
      paymentId: body.paymentId,
      couponCode: body.couponCode,
      shippingLocation: body.shippingLocation,
      items: body.items as CartItem[] | undefined
    });
    ok(res, order, 201);
  } catch (err) {
    next(err);
  }
});

// POST /orders — simplified checkout alias for storefront compat
router.post('/orders', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const body = req.body;
    // Accept simplified body format: { items, shippingAddress, paymentMethod, couponCode }
    const shipping = body.shippingAddress || body.customer || {};
    const customer = {
      fullName: shipping.name || shipping.fullName || req.user?.fullName || 'Customer',
      email: shipping.email || req.user?.email || 'customer@store.com',
      phone: shipping.phone || req.user?.phone || '+8801700000000',
      division: shipping.division || shipping.city || 'Dhaka',
      district: shipping.district || shipping.city || 'Dhaka',
      address: shipping.address || 'Dhaka, Bangladesh',
      deliveryNotes: shipping.notes || body.deliveryNotes
    };
    const order = await createOrder({
      ownerKey: ownerKey(req),
      customer,
      paymentMethod: (body.paymentMethod || 'COD').toUpperCase() as any,
      paymentId: body.paymentId,
      couponCode: body.couponCode,
      shippingLocation: body.shippingLocation || 'inside_dhaka',
      items: body.items as CartItem[] | undefined
    });
    ok(res, order, 201);
  } catch (err) {
    next(err);
  }
});

router.get('/orders/export', requireAdmin, requirePermission('orders.view', 'reports.export'), (_req, res) => {
  const csv = exportOrdersCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
  res.send(csv);
});

router.get('/orders', optionalAuth, (req: AuthedRequest, res) => {
  if (req.user?.role === 'ADMIN') {
    ok(res, listOrders());
    return;
  }
  if (req.user) {
    ok(res, listOrders({ email: req.user.email }));
    return;
  }
  fail(res, 'Authentication required.', 401);
});

router.get('/orders/track', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  if (!query.trim()) {
    fail(res, 'Provide an order number or phone.', 400);
    return;
  }
  const orders = listOrders({ query });
  if (orders.length === 0) {
    fail(res, 'Order not found.', 404);
    return;
  }
  ok(res, orders[0]);
});

router.get('/orders/:id', optionalAuth, (req: AuthedRequest, res) => {
  const order = getOrder(req.params.id);
  if (!order) {
    fail(res, 'Order not found.', 404);
    return;
  }
  if (req.user?.role !== 'ADMIN' && req.user && req.user.email.toLowerCase() !== order.customer.email.toLowerCase()) {
    fail(res, 'Order not found.', 404);
    return;
  }
  ok(res, order);
});

router.get('/orders/:id/invoice', optionalAuth, (req: AuthedRequest, res) => {
  const invoice = generateInvoice(req.params.id);
  if (req.user?.role !== 'ADMIN' && req.user && req.user.email.toLowerCase() !== invoice.order.customer.email.toLowerCase()) {
    fail(res, 'Order not found.', 404);
    return;
  }
  if (req.query.format === 'html') {
    res.type('html').send(invoice.html);
    return;
  }
  ok(res, invoice);
});

router.put('/orders/:id/status', requireAdmin, requirePermission('orders.update'), async (req, res, next) => {
  try {
    const body = z
      .object({
        status: z.enum([
          'PENDING',
          'CONFIRMED',
          'PROCESSING',
          'PACKED',
          'SHIPPED',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
          'RETURNED',
          'REFUNDED'
        ])
      })
      .parse(req.body);
    const order = await updateOrderStatus(req.params.id, body.status as OrderStatus);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', requireAdmin, requirePermission('orders.update'), async (req, res, next) => {
  try {
    const body = z.object({ status: z.string() }).parse(req.body);
    const order = await updateOrderStatus(req.params.id, body.status as OrderStatus);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/cancel', requireAdmin, requirePermission('orders.cancel'), async (req, res, next) => {
  try {
    const order = await cancelOrder(req.params.id);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/refund', requireAdmin, requirePermission('orders.refund'), async (req, res, next) => {
  try {
    const order = await refundOrder(req.params.id);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/return', requireAdmin, requirePermission('orders.update'), async (req, res, next) => {
  try {
    const order = await returnOrder(req.params.id);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.delete('/orders/:id', requireAdmin, requirePermission('orders.delete', 'orders.cancel', 'orders.update'), async (req: AuthedRequest, res, next) => {
  try {
    const restoreStock = req.query.restoreStock !== 'false';
    const deleted = await deleteOrder(req.params.id, restoreStock, req.user?.id);
    if (!deleted) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, { deleted: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

router.get('/customers', requireAdmin, requirePermission('customers.view'), (_req, res) => ok(res, listCustomers()));
router.get('/customers/:id', requireAdmin, requirePermission('customers.view'), (req, res) => {
  const customer = getCustomer(req.params.id);
  if (!customer) {
    fail(res, 'Customer not found.', 404);
    return;
  }
  ok(res, customer);
});
router.post('/customers', requireAdmin, requirePermission('customers.create'), async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      fullName: z.string().min(2).optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email(),
      phone: z.string().min(6),
      password: z.string().min(6).optional(),
      profileImage: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.string().optional(),
      status: z.enum(['active', 'inactive', 'blocked']).optional()
    });
    const body = schema.parse(req.body);
    ok(res, await createCustomerAdmin(body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/customers/:id', requireAdmin, requirePermission('customers.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateCustomer(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/customers/:id', requireAdmin, requirePermission('customers.delete'), async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteCustomer(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Customer not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});
router.get('/customers/:id/orders', requireAuth, (req: AuthedRequest, res) => {
  if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
    fail(res, 'Access denied.', 403);
    return;
  }
  ok(res, getCustomerOrders(req.params.id));
});

router.get('/customers/:id/wishlist', requireAuth, (req: AuthedRequest, res) => {
  if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
    fail(res, 'Access denied.', 403);
    return;
  }
  ok(res, getCustomerWishlist(req.params.id));
});

router.get('/customers/:id/addresses', requireAuth, (req: AuthedRequest, res) => {
  if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
    fail(res, 'Access denied.', 403);
    return;
  }
  ok(res, listCustomerAddresses(req.params.id));
});

router.post('/customers/:id/addresses', requireAuth, async (req: AuthedRequest, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
    fail(res, 'Access denied.', 403);
    return;
  }
  try {
    const schema = z.object({
      label: z.string().min(1).optional(),
      address: z.string().min(3),
      division: z.string().min(2).optional(),
      district: z.string().min(2).optional(),
      phone: z.string().min(6).optional(),
      isDefault: z.boolean().optional(),
      name: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      addressType: z.string().optional()
    });
    const body = schema.parse(req.body);
    ok(
      res,
      await addCustomerAddress(req.params.id, {
        label: body.label || 'Home',
        address: body.address,
        division: body.division || 'Dhaka',
        district: body.district || 'Dhaka City',
        phone: body.phone || req.user?.phone || '',
        name: body.name || req.user?.fullName,
        city: body.city,
        postalCode: body.postalCode,
        country: body.country || 'Bangladesh',
        addressType: body.addressType || 'shipping',
        isDefault: body.isDefault ?? false
      }),
      201
    );
  } catch (err) {
    next(err);
  }
});

router.put('/customers/:id/addresses/:addressId', requireAuth, async (req: AuthedRequest, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
    fail(res, 'Access denied.', 403);
    return;
  }
  try {
    ok(res, await updateCustomerAddress(req.params.id, req.params.addressId, req.body));
  } catch (err) {
    next(err);
  }
});

router.delete('/customers/:id/addresses/:addressId', requireAuth, async (req: AuthedRequest, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
    fail(res, 'Access denied.', 403);
    return;
  }
  try {
    const deleted = await deleteCustomerAddress(req.params.id, req.params.addressId);
    if (!deleted) {
      fail(res, 'Address not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.post('/customers/:id/addresses/:addressId/default', requireAuth, async (req: AuthedRequest, res, next) => {
  if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
    fail(res, 'Access denied.', 403);
    return;
  }
  try {
    ok(res, await setDefaultCustomerAddress(req.params.id, req.params.addressId));
  } catch (err) {
    next(err);
  }
});

router.get('/reviews', requireAdmin, (_req, res) => ok(res, listReviewsAdmin()));
router.get('/reviews/:id', (req, res) => {
  const review = getReview(req.params.id);
  if (!review) {
    fail(res, 'Review not found.', 404);
    return;
  }
  ok(res, review);
});
router.put('/reviews/:id/approve', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await moderateReview(req.params.id, 'approved', req.body?.adminReply));
  } catch (err) {
    next(err);
  }
});
router.put('/reviews/:id/reject', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await moderateReview(req.params.id, 'rejected', req.body?.adminReply));
  } catch (err) {
    next(err);
  }
});
router.post('/reviews/:id/reply', requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ adminReply: z.string().min(1) }).parse(req.body);
    ok(res, await moderateReview(req.params.id, 'approved', body.adminReply));
  } catch (err) {
    next(err);
  }
});
router.delete('/reviews/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteReview(req.params.id);
    if (!deleted) {
      fail(res, 'Review not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/inquiries', requireAdmin, (_req, res) => ok(res, listInquiries()));
router.get('/inquiries/:id', requireAdmin, (req, res) => {
  const inq = getInquiry(req.params.id);
  if (!inq) {
    fail(res, 'Inquiry not found.', 404);
    return;
  }
  ok(res, inq);
});
router.post('/inquiries', async (req, res, next) => {
  try {
    const body = z
      .object({
        productId: z.string(),
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(6),
        message: z.string().min(4)
      })
      .parse(req.body);
    ok(res, await createInquiry(body), 201);
  } catch (err) {
    next(err);
  }
});
router.post('/inquiries/:id/reply', requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ adminReply: z.string().min(2) }).parse(req.body);
    ok(res, await replyInquiry(req.params.id, body.adminReply));
  } catch (err) {
    next(err);
  }
});
router.patch('/inquiries/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ status: z.string().min(1) }).parse(req.body);
    ok(res, await updateInquiryStatus(req.params.id, body.status));
  } catch (err) {
    next(err);
  }
});
router.delete('/inquiries/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteInquiry(req.params.id);
    if (!deleted) {
      fail(res, 'Inquiry not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/pages', (_req, res) => ok(res, listPages()));
router.get('/pages/:id', (req, res) => {
  const page = getPage(req.params.id);
  if (!page) {
    fail(res, 'Page not found.', 404);
    return;
  }
  ok(res, page);
});
router.post('/pages', requireAdmin, requirePermission('pages.create'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await createPage(req.body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/pages/:id', requireAdmin, requirePermission('pages.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updatePage(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/pages/:id/publish', requireAdmin, requirePermission('pages.publish'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await publishPage(req.params.id, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/pages/:id', requireAdmin, requirePermission('pages.delete'), async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deletePage(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Page not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/blog', (_req, res) => ok(res, listBlogPosts()));
router.get('/blog/:id', (req, res) => {
  const post = getBlogPost(req.params.id);
  if (!post) {
    fail(res, 'Blog post not found.', 404);
    return;
  }
  ok(res, post);
});
router.post('/blog', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await upsertBlog(req.body, undefined, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/blog/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await upsertBlog(req.body, req.params.id, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/blog/:id/publish', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await publishBlogPost(req.params.id, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.post('/blog/:id/schedule', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ publishDate: z.string() }).parse(req.body);
    ok(res, await scheduleBlogPost(req.params.id, body.publishDate, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/blog/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, { deleted: await deleteBlog(req.params.id) });
  } catch (err) {
    next(err);
  }
});

router.get('/media', requireAdmin, (_req, res) => ok(res, listMedia()));
router.get('/media/folders', requireAdmin, (_req, res) => ok(res, listMediaFolders()));
router.get('/media/:id', requireAdmin, (req, res) => {
  const m = getMedia(req.params.id);
  if (!m) {
    fail(res, 'Media not found.', 404);
    return;
  }
  ok(res, m);
});
router.post('/media/upload', requireAdmin, async (req, res, next) => {
  try {
    const raw = req.body || {};
    const filename = raw.filename || raw.name || 'image.jpg';
    const body = z
      .object({
        filename: z.string().min(3),
        mimeType: z.string().min(3).default('image/jpeg'),
        url: z.string().min(4),
        folder: z.string().optional().default('general'),
        size: z.number().optional().default(102400)
      })
      .parse({ ...raw, filename });
    ok(res, await addMedia(body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/media/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await updateMedia(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
});
router.delete('/media/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteMedia(req.params.id);
    if (!deleted) {
      fail(res, 'Media not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/settings', (_req, res) => ok(res, getSettings()));
router.put('/settings', requireAdmin, requirePermission('settings.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateSettings(req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.get(['/seo', '/settings/seo'], (_req, res) => ok(res, getSeo()));
router.all(['/seo', '/settings/seo'], requireAdmin, async (req: AuthedRequest, res, next) => {
  if (req.method === 'GET') {
    ok(res, getSeo());
    return;
  }
  if (req.method === 'PUT' || req.method === 'POST' || req.method === 'PATCH') {
    try {
      ok(res, await updateSeo(req.body, actor(req)));
    } catch (err) {
      next(err);
    }
    return;
  }
  next();
});
router.get('/seo/redirects', requireAdmin, (_req, res) => ok(res, listRedirects()));
router.post('/seo/redirects', requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ fromPath: z.string(), toPath: z.string(), statusCode: z.union([z.literal(301), z.literal(302)]).optional() }).parse(req.body);
    ok(res, await addRedirect(body.fromPath, body.toPath, body.statusCode), 201);
  } catch (err) {
    next(err);
  }
});
router.delete('/seo/redirects/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteRedirect(req.params.id);
    if (!deleted) {
      fail(res, 'Redirect not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});
router.get('/seo/sitemap.xml', (_req, res) => {
  res.type('application/xml').send(sitemapXml());
});

router.get('/shipping', (_req, res) => ok(res, listShipping()));
router.get('/shipping/:id', (req, res) => {
  const method = getShippingMethod(req.params.id);
  if (!method) {
    fail(res, 'Shipping method not found.', 404);
    return;
  }
  ok(res, method);
});
router.post('/shipping', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertShipping(req.body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/shipping/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertShipping(req.body, req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/shipping/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteShippingMethod(req.params.id);
    if (!deleted) {
      fail(res, 'Shipping method not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/payments', requireAdmin, (_req, res) => ok(res, listPayments()));
router.get('/payments/:id', requireAdmin, (req, res) => {
  const payment = getPayment(req.params.id);
  if (!payment) {
    fail(res, 'Payment not found.', 404);
    return;
  }
  ok(res, payment);
});
router.post('/payments', requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      orderId: z.string(),
      amount: z.number().positive(),
      paymentMethod: z.string(),
      transactionId: z.string().optional(),
      currency: z.string().optional(),
      status: z.string().optional()
    });
    const body = schema.parse(req.body);
    ok(res, await recordPayment(body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/payments/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ status: z.string(), gatewayResponse: z.unknown().optional() }).parse(req.body);
    ok(res, await updatePaymentStatus(req.params.id, body.status, body.gatewayResponse));
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', requireAdmin, (_req, res) => ok(res, cmsDashboard()));
router.get('/admin/stats', requireAdmin, (_req, res) => ok(res, cmsDashboard()));

// All 10 reports with CSV export support
router.get('/reports/sales', requireAdmin, requirePermission('reports.view'), (req, res) => {
  const filter = {
    from: (req.query.from as string) || (req.query.startDate as string) || undefined,
    to: (req.query.to as string) || (req.query.endDate as string) || undefined,
    paymentMethod: (req.query.paymentMethod as string) || undefined,
    status: (req.query.status as string) || (req.query.orderStatus as string) || undefined,
    search: (req.query.search as string) || (req.query.q as string) || undefined
  };
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.csv"');
    res.send(exportSalesReportCsv(filter));
    return;
  }
  ok(res, salesReport(filter));
});

router.get('/reports/products', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product_sales_report.csv"');
    res.send(exportProductSalesCsv());
    return;
  }
  ok(res, productSalesReport());
});

router.get('/reports/inventory', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory_report.csv"');
    res.send(exportInventoryReportCsv());
    return;
  }
  ok(res, inventoryReport());
});

router.get('/reports/stock-movement', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="stock_movement_report.csv"');
    res.send(exportStockMovementCsv());
    return;
  }
  ok(res, stockMovementReport());
});

router.get('/reports/orders', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_report.csv"');
    res.send(exportOrdersReportCsv());
    return;
  }
  ok(res, ordersReport());
});

router.get('/reports/customers', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers_report.csv"');
    res.send(exportCustomersReportCsv());
    return;
  }
  ok(res, customersReport());
});

router.get('/reports/profit', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="profit_margins_report.csv"');
    res.send(exportProfitCsv());
    return;
  }
  ok(res, profitReport());
});

router.get('/reports/discounts', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="discounts_report.csv"');
    res.send(exportDiscountCsv());
    return;
  }
  ok(res, discountReport());
});

router.get('/reports/payments', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments_report.csv"');
    res.send(exportPaymentCsv());
    return;
  }
  ok(res, paymentReport());
});

router.get('/reports/shipping', requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.export === 'csv' || req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="shipping_report.csv"');
    res.send(exportShippingCsv());
    return;
  }
  ok(res, shippingReport());
});

router.get('/audit-logs', requireAdmin, (_req, res) => ok(res, listAuditLogs()));

router.get('/notifications', requireAdmin, (_req, res) => ok(res, listNotifications()));
router.post('/notifications/send', requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      channel: z.enum(['email', 'sms', 'push', 'whatsapp']),
      event: z.string(),
      payload: z.unknown()
    });
    const body = schema.parse(req.body);
    ok(res, await sendNotification({ channel: body.channel, event: body.event, payload: body.payload ?? {} }), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/notifications/:id/read', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await markNotificationSent(req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/notifications/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteNotification(req.params.id);
    if (!deleted) {
      fail(res, 'Notification not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});
router.delete('/notifications', requireAdmin, async (_req, res, next) => {
  try {
    await clearNotifications();
    ok(res, { cleared: true });
  } catch (err) {
    next(err);
  }
});

router.get('/permissions', requireAdmin, (_req, res) => ok(res, getAllPermissions()));

router.get('/roles', requireAdmin, (_req, res) => ok(res, listRoles()));
router.get('/roles/:id', requireAdmin, (req, res) => {
  const role = getRole(req.params.id);
  if (!role) {
    fail(res, 'Role not found.', 404);
    return;
  }
  ok(res, role);
});
router.post('/roles', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      label: z.string().min(2),
      permissions: z.array(z.string())
    });
    const body = schema.parse(req.body);
    ok(res, await createRole(body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/roles/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateRole(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/roles/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteRole(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Role not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/admins', requireAdmin, (_req, res) => ok(res, listAdmins()));
router.get('/admins/:id', requireAdmin, (req, res) => {
  const admin = getAdmin(req.params.id);
  if (!admin) {
    fail(res, 'Admin not found.', 404);
    return;
  }
  ok(res, admin);
});
router.post('/admins', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(6),
        password: z.string().min(6),
        roleId: z.string().optional()
      })
      .parse(req.body);
    ok(res, await createAdmin(body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/admins/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateAdmin(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete('/admins/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteAdmin(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Admin not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Customer Account & Self-Service Endpoints
// ==========================================
router.get(['/customer/profile', '/customers/me'], requireAuth, (req: AuthedRequest, res) => {
  ok(res, req.user);
});

router.patch(['/customer/profile', '/customers/me'], requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateProfile(req.user!.id, req.body));
  } catch (err) {
    next(err);
  }
});

router.put(['/customer/profile', '/customers/me'], requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateProfile(req.user!.id, req.body));
  } catch (err) {
    next(err);
  }
});

router.get(['/customer/addresses', '/customers/me/addresses'], requireAuth, (req: AuthedRequest, res) => {
  ok(res, listCustomerAddresses(req.user!.id));
});

router.post(['/customer/addresses', '/customers/me/addresses'], requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      label: z.string().min(1).optional(),
      address: z.string().min(3),
      division: z.string().min(2).optional(),
      district: z.string().min(2).optional(),
      phone: z.string().min(6).optional(),
      isDefault: z.boolean().optional(),
      name: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      addressType: z.string().optional()
    });
    const body = schema.parse(req.body);
    ok(
      res,
      await addCustomerAddress(req.user!.id, {
        label: body.label || 'Home',
        address: body.address,
        division: body.division || 'Dhaka',
        district: body.district || 'Dhaka City',
        phone: body.phone || req.user?.phone || '',
        name: body.name || req.user?.fullName,
        city: body.city,
        postalCode: body.postalCode,
        country: body.country || 'Bangladesh',
        addressType: body.addressType || 'shipping',
        isDefault: body.isDefault ?? false
      }),
      201
    );
  } catch (err) {
    next(err);
  }
});

router.put(['/customer/addresses/:addressId', '/customers/me/addresses/:addressId'], requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateCustomerAddress(req.user!.id, req.params.addressId, req.body));
  } catch (err) {
    next(err);
  }
});

router.delete(['/customer/addresses/:addressId', '/customers/me/addresses/:addressId'], requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteCustomerAddress(req.user!.id, req.params.addressId);
    if (!deleted) {
      fail(res, 'Address not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.post(['/customer/addresses/:addressId/default', '/customers/me/addresses/:addressId/default'], requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await setDefaultCustomerAddress(req.user!.id, req.params.addressId));
  } catch (err) {
    next(err);
  }
});

router.get(['/customer/orders', '/customers/me/orders'], requireAuth, (req: AuthedRequest, res) => {
  ok(res, getCustomerOrders(req.user!.id));
});

router.get(['/customer/wishlist', '/customers/me/wishlist'], requireAuth, (req: AuthedRequest, res) => {
  ok(res, getCustomerWishlist(req.user!.id));
});

// ==========================================
// Authentication Aliases & Role-Specific Logins
// ==========================================
router.post(['/auth/admin/login', '/admin/login'], async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const result = await login(body.email, body.password);
    if (result.user.role !== 'ADMIN') {
      fail(res, 'Admin privileges required.', 403);
      return;
    }
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

router.post(['/auth/customer/login', '/customer/login'], async (req, res, next) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    ok(res, await login(body.email, body.password));
  } catch (err) {
    next(err);
  }
});

router.post(['/auth/customer/register', '/customer/register'], async (req, res, next) => {
  try {
    const body = z
      .object({
        fullName: z.string().min(2).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        email: z.string().email(),
        phone: z.string().min(8),
        password: z.string().min(6)
      })
      .parse(req.body);
    const fullName =
      body.fullName ||
      [body.firstName || body.first_name, body.lastName || body.last_name].filter(Boolean).join(' ') ||
      'Customer';
    ok(res, await register({ fullName, email: body.email, phone: body.phone, password: body.password }), 201);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Specification Compatibility Aliases
// ==========================================
router.get('/products/:id/images', (req, res) => {
  const prod = getProduct(req.params.id);
  if (!prod) {
    fail(res, 'Product not found.', 404);
    return;
  }
  const db = loadDb();
  const dbImages = db.productImages?.filter((img: { productId: string }) => img.productId === req.params.id) || [];
  const images = dbImages.length
    ? dbImages
    : (prod.images || []).map((img, i) => ({
        id: `img-${i}`,
        productId: prod.id,
        url: img,
        isPrimary: i === 0,
        altText: prod.name,
        sortOrder: i
      }));
  ok(res, images);
});

router.get('/products/:productId/variants/:variantId', (req, res) => {
  const variant = getVariant(req.params.variantId);
  if (!variant || variant.productId !== req.params.productId) {
    fail(res, 'Variant not found.', 404);
    return;
  }
  ok(res, variant);
});

router.put('/products/:productId/variants/:variantId', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateVariant(req.params.variantId, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:productId/variants/:variantId', requireAdmin, requirePermission('products.update'), async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteVariant(req.params.variantId, actor(req));
    if (!deleted) {
      fail(res, 'Variant not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/status', requireAdmin, requirePermission('orders.update'), async (req, res, next) => {
  try {
    const body = z.object({ status: z.string() }).parse(req.body);
    const order = await updateOrderStatus(req.params.id, body.status as OrderStatus);
    if (!order) {
      fail(res, 'Order not found.', 404);
      return;
    }
    ok(res, order);
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:id/payments', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        paymentMethod: z.enum(['cash_on_delivery', 'bank_transfer', 'online_payment', 'mobile_payment']),
        amount: z.number().positive(),
        currency: z.string().default('BDT'),
        transactionId: z.string().optional(),
        status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('paid')
      })
      .parse(req.body);
    ok(res, await recordPayment({ ...body, orderId: req.params.id }), 201);
  } catch (err) {
    next(err);
  }
});

router.post(['/media/:id/replace', '/media/:id/file'], requireAdmin, async (req, res, next) => {
  try {
    const body = z.object({ url: z.string().min(4), title: z.string().optional() }).parse(req.body);
    ok(res, await updateMedia(req.params.id, body));
  } catch (err) {
    next(err);
  }
});

router.get(['/admin-users', '/admin_users'], requireAdmin, (_req, res) => ok(res, listAdmins()));
router.get(['/admin-users/:id', '/admin_users/:id'], requireAdmin, (req, res) => {
  const admin = getAdmin(req.params.id);
  if (!admin) {
    fail(res, 'Admin not found.', 404);
    return;
  }
  ok(res, admin);
});
router.post(['/admin-users', '/admin_users'], requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(6),
        password: z.string().min(6),
        roleId: z.string().optional()
      })
      .parse(req.body);
    ok(res, await createAdmin(body, actor(req)), 201);
  } catch (err) {
    next(err);
  }
});
router.put(['/admin-users/:id', '/admin_users/:id'], requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateAdmin(req.params.id, req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});
router.delete(['/admin-users/:id', '/admin_users/:id'], requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteAdmin(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Admin not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/product-inquiries', requireAdmin, (_req, res) => ok(res, listInquiries()));
router.get('/product-inquiries/:id', requireAdmin, (req, res) => {
  const inq = getInquiry(req.params.id);
  if (!inq) {
    fail(res, 'Inquiry not found.', 404);
    return;
  }
  ok(res, inq);
});
router.post('/product-inquiries', async (req, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(6).optional(),
      message: z.string().min(5)
    });
    const body = schema.parse(req.body);
    ok(res, await createInquiry({ ...body, phone: body.phone || '' }), 201);
  } catch (err) {
    next(err);
  }
});
router.post('/product-inquiries/:id/reply', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ reply: z.string().min(1) }).parse(req.body);
    ok(res, await replyInquiry(req.params.id, body.reply));
  } catch (err) {
    next(err);
  }
});
router.delete('/product-inquiries/:id', requireAdmin, async (req, res) => {
  const deleted = await deleteInquiry(req.params.id);
  if (!deleted) {
    fail(res, 'Inquiry not found.', 404);
    return;
  }
  ok(res, { deleted: true });
});

router.get('/shipping-methods', (_req, res) => ok(res, listShipping()));
router.get('/shipping-methods/:id', (req, res) => {
  const method = getShippingMethod(req.params.id);
  if (!method) {
    fail(res, 'Shipping method not found.', 404);
    return;
  }
  ok(res, method);
});
router.post('/shipping-methods', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertShipping(req.body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/shipping-methods/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertShipping(req.body, req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/shipping-methods/:id', requireAdmin, async (req, res) => {
  const deleted = await deleteShippingMethod(req.params.id);
  if (!deleted) {
    fail(res, 'Shipping method not found.', 404);
    return;
  }
  ok(res, { deleted: true });
});

// Payment Methods & Gateways Management
router.get(
  ['/payment-methods', '/payment_methods', '/payment-gateways', '/payment_gateways'],
  (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    ok(res, listPaymentMethods(status));
  }
);

router.get(
  ['/payment-methods/stats', '/payment_methods/stats', '/payment-gateways/stats', '/payment_gateways/stats'],
  requireAdmin,
  (_req, res) => {
    ok(res, getPaymentGatewayStats());
  }
);

router.get(
  ['/payment-methods/:id', '/payment_methods/:id', '/payment-gateways/:id', '/payment_gateways/:id'],
  (req, res) => {
    const method = getPaymentMethod(req.params.id);
    if (!method) {
      fail(res, 'Payment gateway not found.', 404);
      return;
    }
    ok(res, method);
  }
);

router.post(
  ['/payment-methods', '/payment_methods', '/payment-gateways', '/payment_gateways'],
  requireAdmin,
  async (req, res, next) => {
    try {
      ok(res, await upsertPaymentMethod(req.body), 201);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  ['/payment-methods/:id', '/payment_methods/:id', '/payment-gateways/:id', '/payment_gateways/:id'],
  requireAdmin,
  async (req, res, next) => {
    try {
      ok(res, await upsertPaymentMethod(req.body, req.params.id));
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  ['/payment-methods/:id/toggle', '/payment_methods/:id/toggle', '/payment-gateways/:id/toggle', '/payment_gateways/:id/toggle'],
  requireAdmin,
  async (req, res, next) => {
    try {
      ok(res, await togglePaymentMethod(req.params.id));
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  ['/payment-methods/:id', '/payment_methods/:id', '/payment-gateways/:id', '/payment_gateways/:id'],
  requireAdmin,
  async (req, res) => {
    const deleted = await deletePaymentMethod(req.params.id);
    if (!deleted) {
      fail(res, 'Payment gateway not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  }
);

// Payment Gateway Connection Test & Credential Verification
router.post(
  [
    '/payment-methods/:id/test',
    '/payment-methods/:id/test-connection',
    '/payment-gateways/:id/test',
    '/payment-gateways/:id/test-connection'
  ],
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await testGatewayConnection(req.params.id, req.body);
      ok(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// Payment Gateway Checkout Initiation & Verification
router.post(['/payment-gateways/initiate', '/payments/initiate'], optionalAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      orderId: z.string(),
      gatewayCode: z.string().optional(),
      paymentMethodId: z.string().optional(),
      amount: z.number().positive().optional(),
      customerEmail: z.string().email().optional(),
      customerPhone: z.string().optional(),
      callbackUrl: z.string().url().optional()
    });
    const body = schema.parse(req.body);
    ok(res, await initiateGatewayPayment(body), 200);
  } catch (err) {
    next(err);
  }
});

router.post(['/payment-gateways/verify', '/payments/verify'], optionalAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      transactionId: z.string(),
      paymentId: z.string().optional(),
      orderId: z.string().optional(),
      val_id: z.string().optional(),
      gatewayCode: z.string().optional()
    });
    const body = schema.parse(req.body);
    ok(res, await verifyGatewayPayment(body), 200);
  } catch (err) {
    next(err);
  }
});

router.post(['/payment-gateways/refund', '/payments/:id/refund'], requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const targetId = req.params.id || req.body.paymentId || req.body.transactionId;
    if (!targetId) {
      fail(res, 'Payment transaction ID or ID required.', 400);
      return;
    }
    const result = await processGatewayRefund(targetId, {
      amount: req.body.amount,
      reason: req.body.reason,
      actorId: actor(req)
    });
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

// Gateway Webhook / IPN / Callback Handlers
router.all(['/payment-gateways/bkash/callback', '/payments/bkash/callback'], async (req, res, next) => {
  try {
    const payload = { ...(req.query as object), ...(req.body as object) };
    const result = await handleGatewayWebhook('bkash', payload);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

router.all(['/payment-gateways/sslcommerz/ipn', '/payments/sslcommerz/ipn'], async (req, res, next) => {
  try {
    const payload = { ...(req.query as object), ...(req.body as object) };
    const result = await handleGatewayWebhook('sslcommerz', payload);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

router.all(['/payment-gateways/sslcommerz/success', '/payments/sslcommerz/success'], async (req, res, next) => {
  try {
    const payload = { ...(req.query as object), ...(req.body as object) };
    const result = await handleGatewayWebhook('sslcommerz', { ...payload, status: 'VALID' });
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

router.all(['/payment-gateways/sslcommerz/fail', '/payments/sslcommerz/fail'], async (req, res, next) => {
  try {
    const payload = { ...(req.query as object), ...(req.body as object) };
    const result = await handleGatewayWebhook('sslcommerz', { ...payload, status: 'FAILED' });
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

router.all(['/payment-gateways/sslcommerz/cancel', '/payments/sslcommerz/cancel'], async (req, res, next) => {
  try {
    const payload = { ...(req.query as object), ...(req.body as object) };
    const result = await handleGatewayWebhook('sslcommerz', { ...payload, status: 'CANCELLED' });
    ok(res, result);
  } catch (err) {
    next(err);
  }
});

router.all(['/payment-gateways/nagad/callback', '/payments/nagad/callback'], async (req, res, next) => {
  try {
    const payload = { ...(req.query as object), ...(req.body as object) };
    const result = await handleGatewayWebhook('nagad', payload);
    ok(res, result);
  } catch (err) {
    next(err);
  }
});



router.get('/homepage_sections', (_req, res) => ok(res, listHomepage()));
router.get('/homepage_sections/:id', (req, res) => {
  const section = getHomepageSection(req.params.id);
  if (!section) {
    fail(res, 'Homepage section not found.', 404);
    return;
  }
  ok(res, section);
});
router.post('/homepage_sections', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertHomepage(req.body), 201);
  } catch (err) {
    next(err);
  }
});
router.put('/homepage_sections/:id', requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertHomepage(req.body, req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete('/homepage_sections/:id', requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const deleted = await deleteHomepageSection(req.params.id, actor(req));
    if (!deleted) {
      fail(res, 'Homepage section not found.', 404);
      return;
    }
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

router.get('/audit_logs', requireAdmin, (_req, res) => ok(res, listAuditLogs()));

router.get(['/discounts', '/offers-discounts'], (_req, res) => ok(res, listOffers()));
router.get(['/discounts/:id', '/offers-discounts/:id'], (req, res) => {
  const offer = getOffer(req.params.id);
  if (!offer) {
    fail(res, 'Offer not found.', 404);
    return;
  }
  ok(res, offer);
});
router.post(['/discounts', '/offers-discounts'], requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertOffer(req.body), 201);
  } catch (err) {
    next(err);
  }
});
router.put(['/discounts/:id', '/offers-discounts/:id'], requireAdmin, async (req, res, next) => {
  try {
    ok(res, await upsertOffer(req.body, req.params.id));
  } catch (err) {
    next(err);
  }
});
router.delete(['/discounts/:id', '/offers-discounts/:id'], requireAdmin, async (req, res) => {
  const deleted = await deleteOffer(req.params.id);
  if (!deleted) {
    fail(res, 'Offer not found.', 404);
    return;
  }
  ok(res, { deleted: true });
});

router.get('/website-settings', (_req, res) => ok(res, getSettings()));
router.put('/website-settings', requireAdmin, requirePermission('settings.update'), async (req: AuthedRequest, res, next) => {
  try {
    ok(res, await updateSettings(req.body, actor(req)));
  } catch (err) {
    next(err);
  }
});

router.get(['/reports/product-sales', '/reports/product_sales'], requireAdmin, requirePermission('reports.view'), (req, res) => {
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product-sales.csv"');
    res.send(exportProductSalesCsv());
    return;
  }
  ok(res, productSalesReport());
});

// AI Assistant & Generation Subsystem
import aiRouter from './ai.ts';
router.use('/ai', aiRouter);

// Live Chat & Concierge Subsystem
import chatRouter from './chat.ts';
router.use('/chat', chatRouter);

export default router;

