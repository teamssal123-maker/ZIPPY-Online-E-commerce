import { loadDb, mutateDb, publicUser, type AuthUser, type DbShape } from '../store/db.ts';
import type { Category, Coupon, Order, Product, ProductReview, SavedAddress, User } from '../types/index.ts';
import type {
  AdminRole,
  Banner,
  BlogPost,
  Brand,
  CmsPage,
  FooterLinkItem,
  FooterPillarItem,
  HeaderNavItem,
  HomepageSection,
  InventoryItem,
  InventoryTransaction,
  InventoryTxnType,
  MediaFile,
  NavigationMenu,
  NotificationEvent,
  Offer,
  PaymentRecord,
  ProductImage,
  ProductInquiry,
  ProductVariant,
  RecordStatus,
  RoleRecord,
  SeoRedirect,
  SeoSettings,
  PaymentMethodConfig,
  ShippingMethod,
  Warehouse,
  WebsiteSettings,
  SalesReportFilter,
  SalesReportResult
} from '../types/cms.ts';
import { createId, slugify } from '../utils/ids.ts';
import { httpError } from '../utils/errors.ts';
import { appendAudit } from './audit.ts';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.ts';

const now = () => new Date().toISOString();

function notDeleted<T extends { deletedAt?: string | null }>(rows: T[]): T[] {
  return rows.filter((row) => !row.deletedAt);
}

export function logAction(
  db: DbShape,
  userId: string | undefined,
  action: string,
  module: string,
  recordId?: string,
  oldValue?: unknown,
  newValue?: unknown,
  reqMeta?: { ip?: string; ua?: string }
) {
  if (!userId) return;
  appendAudit(db, {
    userId,
    action,
    module,
    recordId,
    oldValue,
    newValue,
    ipAddress: reqMeta?.ip,
    userAgent: reqMeta?.ua
  });
}

export function listBrands(includeDeleted = false): Brand[] {
  const db = loadDb();
  const brands = includeDeleted ? db.brands : notDeleted(db.brands);
  const products = db.products.filter((p) => !p.deletedAt);

  return brands
    .map((brand) => {
      const brandProducts = products.filter(
        (p) =>
          p.brandId === brand.id ||
          p.brandId === brand.slug ||
          p.brandId === brand.name ||
          (p as any).brand === brand.name ||
          (p as any).brand === brand.slug
      );
      const totalStockUnits = brandProducts.reduce(
        (sum, p) => sum + (p.stockQuantity ?? Object.values(p.stock || {}).reduce((a, b) => a + b, 0)),
        0
      );

      return {
        ...brand,
        itemCount: brandProducts.length,
        totalStockUnits
      };
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function createBrand(input: Partial<Brand>, userId?: string): Promise<Brand> {
  return mutateDb(async (db) => {
    const brand: Brand = {
      id: input.id || slugify(input.name || createId('brd')),
      name: input.name || 'Untitled Brand',
      slug: input.slug || slugify(input.name || 'brand'),
      logo: input.logo || '',
      banner: input.banner || '',
      description: input.description || '',
      website: input.website || '',
      status: input.status || 'active',
      featured: Boolean(input.featured),
      sortOrder: input.sortOrder ?? db.brands.length + 1,
      metaTitle: input.metaTitle || input.name || '',
      metaDescription: input.metaDescription || '',
      createdAt: now(),
      updatedAt: now()
    };
    if (db.brands.some((b) => !b.deletedAt && (b.id === brand.id || b.slug === brand.slug))) {
      httpError('Brand with this identifier or slug already exists.', 409);
    }
    db.brands.push(brand);
    logAction(db, userId, 'brand_created', 'brands', brand.id, undefined, brand);
    return brand;
  });
}

export async function updateBrand(id: string, updates: Partial<Brand>, userId?: string): Promise<Brand> {
  return mutateDb(async (db) => {
    const brand = db.brands.find((b) => b.id === id);
    if (!brand || brand.deletedAt) httpError('Brand not found.', 404);
    const old = { ...brand };

    if (updates.name && updates.name !== old.name) {
      db.products.forEach((p) => {
        if (!p.deletedAt) {
          if (p.brandId === old.name) p.brandId = updates.name!;
          if ((p as any).brand === old.name) (p as any).brand = updates.name;
        }
      });
    }

    Object.assign(brand, updates, { id, updatedAt: now() });
    logAction(db, userId, 'brand_updated', 'brands', id, old, brand);
    return brand;
  });
}

export async function deleteBrand(id: string, userId?: string): Promise<boolean> {
  return mutateDb(async (db) => {
    const brand = db.brands.find((b) => b.id === id);
    if (!brand || brand.deletedAt) return false;
    brand.deletedAt = now();
    brand.status = 'inactive';
    logAction(db, userId, 'brand_deleted', 'brands', id, brand);
    return true;
  });
}

export async function toggleBrandVisibility(id: string, active?: boolean, userId?: string): Promise<Brand> {
  return mutateDb((db) => {
    const brand = db.brands.find((b) => b.id === id || b.slug === id);
    if (!brand || brand.deletedAt) httpError('Brand not found.', 404);
    const newStatus = active != null ? (active ? 'active' : 'inactive') : brand.status === 'active' ? 'inactive' : 'active';
    brand.status = newStatus;
    brand.updatedAt = now();
    logAction(db, userId, 'brand_updated', 'brands', brand.id, undefined, { status: newStatus });
    return brand;
  });
}

export async function toggleBrandFeatured(id: string, featured?: boolean, userId?: string): Promise<Brand> {
  return mutateDb((db) => {
    const brand = db.brands.find((b) => b.id === id || b.slug === id);
    if (!brand || brand.deletedAt) httpError('Brand not found.', 404);
    const nextFeatured = featured != null ? featured : !brand.featured;
    brand.featured = nextFeatured;
    brand.updatedAt = now();
    logAction(db, userId, 'brand_updated', 'brands', brand.id, undefined, { featured: nextFeatured });
    return brand;
  });
}

export async function reorderBrands(ids: string[]): Promise<Brand[]> {
  return mutateDb((db) => {
    ids.forEach((id, index) => {
      const brand = db.brands.find((b) => b.id === id || b.slug === id);
      if (brand) {
        brand.sortOrder = index + 1;
        brand.updatedAt = now();
      }
    });
    return listBrands();
  });
}

export async function createCategory(input: Partial<Category>, userId?: string): Promise<Category> {
  return mutateDb(async (db) => {
    const category: Category = {
      id: input.id || slugify(input.name || createId('cat')),
      name: input.name || 'Untitled',
      slug: input.slug || slugify(input.name || 'category'),
      image: input.image || '',
      description: input.description || '',
      itemCount: 0,
      parentId: input.parentId ?? null,
      icon: input.icon,
      sortOrder: input.sortOrder ?? db.categories.length + 1,
      status: input.status || 'active',
      metaTitle: input.metaTitle || input.name,
      metaDescription: input.metaDescription,
      createdAt: now(),
      updatedAt: now()
    };
    if (db.categories.some((c) => c.id === category.id || c.slug === category.slug)) {
      httpError('Category already exists.', 409);
    }
    db.categories.push(category);
    logAction(db, userId, 'category_created', 'categories', category.id, undefined, category);
    return category;
  });
}

export async function updateCategory(id: string, updates: Partial<Category>, userId?: string): Promise<Category> {
  return mutateDb(async (db) => {
    const category = db.categories.find((c) => c.id === id || c.slug === id);
    if (!category || category.deletedAt) httpError('Category not found.', 404);

    // Prevent setting self as parent
    if (updates.parentId && (updates.parentId === category.id || updates.parentId === category.slug)) {
      updates.parentId = null;
    }

    const old = { ...category };
    Object.assign(category, updates, { id: category.id, updatedAt: now() });

    // Sync product categoryName if name changed
    if (updates.name && updates.name !== old.name) {
      db.products.forEach((p) => {
        if (p.categoryId === category.id || p.categoryId === old.slug) {
          p.categoryName = updates.name!;
          p.updatedAt = now();
        }
      });
    }

    logAction(db, userId, 'category_updated', 'categories', category.id, old, category);
    return category;
  });
}

export async function deleteCategory(id: string, userId?: string): Promise<boolean> {
  return mutateDb(async (db) => {
    const category = db.categories.find((c) => c.id === id || c.slug === id);
    if (!category) return false;
    category.deletedAt = now();
    category.status = 'inactive';

    // Disconnect child categories so they don't break hierarchy
    db.categories.forEach((c) => {
      if (c.parentId === category.id || c.parentId === category.slug) {
        c.parentId = null;
        c.updatedAt = now();
      }
    });

    logAction(db, userId, 'category_deleted', 'categories', category.id);
    return true;
  });
}

export async function reorderCategories(ids: string[]): Promise<Category[]> {
  return mutateDb((db) => {
    ids.forEach((id, index) => {
      const category = db.categories.find((c) => c.id === id || c.slug === id);
      if (category) {
        category.sortOrder = index + 1;
        category.updatedAt = now();
      }
    });
    return [...db.categories]
      .filter((c) => !c.deletedAt)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  });
}

function stockTotal(product: Product): number {
  return Object.values(product.stock || {}).reduce((a, b) => a + b, 0);
}

export async function duplicateProduct(id: string, userId?: string): Promise<Product> {
  return mutateDb(async (db) => {
    const source = db.products.find((p) => p.id === id);
    if (!source || source.deletedAt) httpError('Product not found.', 404);
    const copy: Product = {
      ...structuredClone(source),
      id: createId('prod'),
      name: `${source.name} Copy`,
      slug: `${source.slug}-copy-${Date.now().toString(36)}`,
      sku: `${source.sku}-COPY`,
      status: 'draft',
      isActive: false,
      createdAt: now(),
      updatedAt: now()
    };
    db.products.unshift(copy);
    logAction(db, userId, 'product_created', 'products', copy.id, undefined, copy);
    return copy;
  });
}

export async function setProductStatus(id: string, status: Product['status'], userId?: string): Promise<Product> {
  return mutateDb(async (db) => {
    const product = db.products.find((p) => p.id === id);
    if (!product || product.deletedAt) httpError('Product not found.', 404);
    const old = product.status;
    product.status = status;
    product.isActive = status === 'published' || status === 'active';
    product.updatedAt = now();
    logAction(db, userId, status === 'published' ? 'product_updated' : 'product_updated', 'products', id, old, status);
    return product;
  });
}

export async function addProductImage(productId: string, url: string, altText = '', userId?: string) {
  return mutateDb(async (db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) httpError('Product not found.', 404);
    product.images = [...(product.images || []), url];
    const image = {
      id: createId('img'),
      productId,
      url,
      altText: altText || product.name,
      isPrimary: product.images.length === 1,
      sortOrder: product.images.length - 1
    };
    db.productImages.push(image);
    product.updatedAt = now();
    logAction(db, userId, 'product_updated', 'products', productId);
    return image;
  });
}

export async function removeProductImage(productId: string, imageId: string, userId?: string) {
  return mutateDb(async (db) => {
    const image = db.productImages.find((i) => i.id === imageId && i.productId === productId);
    const product = db.products.find((p) => p.id === productId);
    if (!product) httpError('Product not found.', 404);
    if (image) {
      db.productImages = db.productImages.filter((i) => i.id !== imageId);
      product.images = product.images.filter((url) => url !== image.url);
    } else {
      const index = Number(imageId);
      if (!Number.isNaN(index) && product.images[index]) {
        product.images.splice(index, 1);
      } else {
        httpError('Image not found.', 404);
      }
    }
    product.updatedAt = now();
    logAction(db, userId, 'product_updated', 'products', productId);
    return { deleted: true };
  });
}

export function exportProductsCsv(): string {
  const products = notDeleted(loadDb().products);
  const header = ['id', 'name', 'sku', 'slug', 'price', 'salePrice', 'categoryId', 'stock', 'status'];
  const rows = products.map((p) =>
    [p.id, p.name, p.sku, p.slug, p.price, p.salePrice ?? '', p.categoryId, stockTotal(p), p.status || 'published']
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export async function importProducts(rows: Array<Partial<Product> & { name: string; sku: string; price: number }>, userId?: string) {
  return mutateDb(async (db) => {
    const created: Product[] = [];
    for (const row of rows) {
      const product: Product = {
        id: createId('prod'),
        name: row.name,
        slug: row.slug || slugify(row.name),
        sku: row.sku,
        styleCode: row.styleCode || `ST-${Math.floor(1000 + Math.random() * 9000)}`,
        categoryId: row.categoryId || 'blazer',
        categoryName: row.categoryName || row.categoryId || 'Blazer & Suits',
        price: row.price,
        salePrice: row.salePrice,
        description: row.description || '',
        shortDescription: row.shortDescription || '',
        fabric: row.fabric || 'Premium fabric',
        fit: row.fit || 'Tailored Fit',
        gender: 'Men',
        images: row.images || [],
        colors: row.colors || [{ name: 'Navy', hex: '#1B2A4A' }],
        sizes: row.sizes || ['S', 'M', 'L', 'XL'],
        stock: row.stock || { S: 5, M: 8, L: 8, XL: 5 },
        featured: row.featured ?? false,
        newArrival: row.newArrival ?? true,
        onSale: Boolean(row.salePrice && row.salePrice < row.price),
        rating: 5,
        reviewCount: 0,
        careInstructions: row.careInstructions || [],
        tags: row.tags || [],
        status: 'draft',
        isActive: false,
        createdAt: now(),
        updatedAt: now()
      };
      db.products.unshift(product);
      created.push(product);
    }
    logAction(db, userId, 'product_created', 'products', created[0]?.id, undefined, { count: created.length });
    return created;
  });
}

function inventoryOf(productId: string, warehouseId?: string): InventoryItem | undefined {
  const db = loadDb();
  return db.inventory.find(
    (item) => item.productId === productId && (!warehouseId || item.warehouseId === warehouseId) && !('deletedAt' in item)
  );
}

function syncProductStockFromInventory(product: Product, quantity: number) {
  product.stockQuantity = quantity;
  const sizes = product.sizes?.length ? product.sizes : Object.keys(product.stock || {});
  if (sizes.length === 0) return;
  const per = Math.floor(quantity / sizes.length);
  const remainder = quantity - per * sizes.length;
  const next: Record<string, number> = {};
  sizes.forEach((size, index) => {
    next[size] = per + (index === 0 ? remainder : 0);
  });
  product.stock = next;
}

export function listInventory(): InventoryItem[] {
  const db = loadDb();
  const warehouseMap = new Map(db.warehouses.map((w) => [w.id, w.name]));
  const defaultWarehouse = db.warehouses[0] || { id: 'wh-dhaka', name: 'Dhaka Atelier Warehouse' };

  for (const product of db.products) {
    if (product.deletedAt) continue;
    const exists = db.inventory.some((i) => i.productId === product.id);
    if (!exists) {
      const qty = Object.values(product.stock || {}).reduce((s, q) => s + q, 0) || product.stockQuantity || 0;
      db.inventory.push({
        id: `inv-${product.id}`,
        productId: product.id,
        warehouseId: defaultWarehouse.id,
        quantity: qty,
        reservedQuantity: 0,
        availableQuantity: qty,
        minimumStock: product.lowStockThreshold ?? 8,
        maximumStock: Math.max(qty, 100),
        updatedAt: now()
      });
    }
  }

  const productMap = new Map(db.products.map((p) => [p.id, p]));

  return db.inventory.map((item) => {
    const product = productMap.get(item.productId);
    const whName = warehouseMap.get(item.warehouseId) || item.warehouseId;
    const available = Math.max(0, item.quantity - (item.reservedQuantity || 0));
    const minStock = item.minimumStock ?? product?.lowStockThreshold ?? 8;
    return {
      ...item,
      availableQuantity: available,
      minimumStock: minStock,
      productName: product?.name || 'Unknown Garment',
      sku: product?.sku || 'N/A',
      productImage: product?.images?.[0] || '',
      categoryName: product?.categoryName || 'General',
      price: product?.price || 0,
      costPrice: product?.costPrice ?? Math.round((product?.price || 0) * 0.5),
      warehouseName: whName,
      status: available <= 0 ? 'out_of_stock' : available <= minStock ? 'low_stock' : 'in_stock'
    };
  });
}

export function lowStock(): InventoryItem[] {
  return listInventory().filter((item) => item.availableQuantity <= item.minimumStock && item.availableQuantity > 0);
}

export function outOfStock(): InventoryItem[] {
  return listInventory().filter((item) => item.availableQuantity <= 0);
}

export async function updateInventoryThresholds(input: {
  productId: string;
  warehouseId?: string;
  minimumStock: number;
  maximumStock?: number;
  userId?: string;
}): Promise<InventoryItem> {
  return mutateDb(async (db) => {
    const warehouseId = input.warehouseId || db.warehouses[0]?.id || 'wh-dhaka';
    let item = db.inventory.find((i) => i.productId === input.productId && i.warehouseId === warehouseId);
    if (!item) {
      const product = db.products.find((p) => p.id === input.productId);
      if (!product) httpError('Product not found.', 404);
      const qty = Object.values(product.stock || {}).reduce((s, q) => s + q, 0) || product.stockQuantity || 0;
      item = {
        id: createId('inv'),
        productId: input.productId,
        warehouseId,
        quantity: qty,
        reservedQuantity: 0,
        availableQuantity: qty,
        minimumStock: Number(input.minimumStock),
        maximumStock: input.maximumStock !== undefined ? Number(input.maximumStock) : Math.max(qty, 100),
        updatedAt: now()
      };
      db.inventory.push(item);
    } else {
      item.minimumStock = Number(input.minimumStock);
      if (input.maximumStock !== undefined) item.maximumStock = Number(input.maximumStock);
      item.updatedAt = now();
    }
    const product = db.products.find((p) => p.id === input.productId);
    if (product) {
      product.lowStockThreshold = item.minimumStock;
      product.updatedAt = now();
    }
    logAction(db, input.userId, 'inventory_updated', 'inventory', item.id, undefined, {
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock
    });
    return item;
  });
}

export async function adjustInventory(input: {
  productId: string;
  warehouseId?: string;
  quantity: number;
  type: InventoryTxnType;
  note?: string;
  reference?: string;
  variantId?: string;
  userId?: string;
}): Promise<{ item: InventoryItem; txn: InventoryTransaction }> {
  return mutateDb(async (db) => {
    const warehouseId = input.warehouseId || db.warehouses[0]?.id;
    if (!warehouseId) httpError('No warehouse configured.', 400);
    const product = db.products.find((p) => p.id === input.productId);
    if (!product) httpError('Product not found.', 404);
    let item = db.inventory.find((i) => i.productId === input.productId && i.warehouseId === warehouseId);
    if (!item) {
      item = {
        id: createId('inv'),
        productId: input.productId,
        variantId: input.variantId,
        warehouseId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        minimumStock: product.lowStockThreshold ?? 8,
        maximumStock: 500,
        updatedAt: now()
      };
      db.inventory.push(item);
    }
    const delta =
      input.type === 'stock_out' || input.type === 'sale' || input.type === 'damage' ? -Math.abs(input.quantity) : input.quantity;
    if (input.type === 'adjustment') {
      item.quantity = input.quantity;
    } else {
      item.quantity = Math.max(0, item.quantity + delta);
    }
    item.availableQuantity = Math.max(0, item.quantity - item.reservedQuantity);
    item.updatedAt = now();
    syncProductStockFromInventory(product, item.availableQuantity);
    product.updatedAt = now();
    const txn: InventoryTransaction = {
      id: createId('itx'),
      productId: input.productId,
      variantId: input.variantId,
      warehouseId,
      type: input.type,
      quantity: input.type === 'adjustment' ? input.quantity : delta,
      reference: input.reference,
      note: input.note,
      createdBy: input.userId || 'system',
      createdAt: now()
    };
    db.inventoryTransactions.unshift(txn);
    if (item.availableQuantity <= 0) {
      db.notifications.unshift({
        id: createId('ntf'),
        channel: 'email',
        event: 'out_of_stock',
        payload: { productId: product.id, sku: product.sku },
        createdAt: now(),
        sent: false
      });
    } else if (item.availableQuantity <= item.minimumStock) {
      db.notifications.unshift({
        id: createId('ntf'),
        channel: 'email',
        event: 'low_stock',
        payload: { productId: product.id, available: item.availableQuantity },
        createdAt: now(),
        sent: false
      });
    }
    logAction(db, input.userId, 'inventory_updated', 'inventory', item.id, undefined, txn);
    return { item, txn };
  });
}

export function inventoryHistory(productId?: string) {
  const txns = loadDb().inventoryTransactions;
  return productId ? txns.filter((t) => t.productId === productId) : txns;
}

export function listWarehouses(): Warehouse[] {
  return loadDb().warehouses;
}

export async function upsertWarehouse(input: Partial<Warehouse> & { name: string }, id?: string): Promise<Warehouse> {
  return mutateDb((db) => {
    if (id) {
      const existing = db.warehouses.find((w) => w.id === id);
      if (!existing) httpError('Warehouse not found.', 404);
      Object.assign(existing, input, { id });
      return existing;
    }
    const warehouse: Warehouse = {
      id: createId('wh'),
      name: input.name,
      code: input.code || `WH-${db.warehouses.length + 1}`,
      address: input.address || '',
      phone: input.phone || '',
      manager: input.manager || '',
      status: input.status || 'active'
    };
    db.warehouses.push(warehouse);
    return warehouse;
  });
}

export function listBanners(activeOnly = false): Banner[] {
  const banners = notDeleted(loadDb().banners);
  if (!activeOnly) return banners.sort((a, b) => a.sortOrder - b.sortOrder);
  const ts = Date.now();
  return banners
    .filter((b) => {
      if (b.status !== 'published' && b.status !== 'active') return false;
      if (b.startDate && Date.parse(b.startDate) > ts) return false;
      if (b.endDate && Date.parse(b.endDate) < ts) return false;
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeBannerData(input: Record<string, unknown>): Partial<Banner> {
  const norm: Record<string, unknown> = { ...input };
  if (input.image_desktop !== undefined && norm.imageDesktop === undefined) norm.imageDesktop = input.image_desktop;
  if (input.image_mobile !== undefined && norm.imageMobile === undefined) norm.imageMobile = input.image_mobile;
  if (input.button_text !== undefined && norm.buttonText === undefined) norm.buttonText = input.button_text;
  if (input.button_url !== undefined && norm.buttonUrl === undefined) norm.buttonUrl = input.button_url;
  if (input.sort_order !== undefined && norm.sortOrder === undefined) norm.sortOrder = Number(input.sort_order);
  if (input.start_date !== undefined && norm.startDate === undefined) norm.startDate = input.start_date;
  if (input.end_date !== undefined && norm.endDate === undefined) norm.endDate = input.end_date;
  return norm as Partial<Banner>;
}

export async function createBanner(rawInput: Partial<Banner>, userId?: string): Promise<Banner> {
  return mutateDb(async (db) => {
    const input = normalizeBannerData(rawInput as Record<string, unknown>);
    const banner: Banner = {
      id: createId('ban'),
      title: input.title || 'Untitled',
      subtitle: input.subtitle || '',
      imageDesktop: input.imageDesktop || '',
      imageMobile: input.imageMobile || input.imageDesktop || '',
      buttonText: input.buttonText || '',
      buttonUrl: input.buttonUrl || '',
      position: input.position || 'hero',
      sortOrder: input.sortOrder ?? db.banners.length + 1,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status || 'draft',
      createdAt: now(),
      updatedAt: now()
    };
    db.banners.push(banner);
    logAction(db, userId, 'banner_updated', 'banners', banner.id, undefined, banner);
    return banner;
  });
}

export async function updateBanner(id: string, rawUpdates: Partial<Banner>, userId?: string): Promise<Banner> {
  return mutateDb(async (db) => {
    const banner = db.banners.find((b) => b.id === id);
    if (!banner || banner.deletedAt) httpError('Banner not found.', 404);
    const old = { ...banner };
    const updates = normalizeBannerData(rawUpdates as Record<string, unknown>);
    Object.assign(banner, updates, { id, updatedAt: now() });
    logAction(db, userId, 'banner_updated', 'banners', id, old, banner);
    return banner;
  });
}

export async function deleteBanner(id: string, userId?: string): Promise<boolean> {
  return mutateDb(async (db) => {
    const banner = db.banners.find((b) => b.id === id);
    if (!banner) return false;
    banner.deletedAt = now();
    banner.status = 'inactive';
    logAction(db, userId, 'banner_updated', 'banners', id);
    return true;
  });
}

export async function publishBanner(id: string, userId?: string): Promise<Banner> {
  return updateBanner(id, { status: 'published' }, userId);
}

export function listPages(includeDeleted = false): CmsPage[] {
  const pages = loadDb().pages;
  return includeDeleted ? pages : notDeleted(pages);
}

export async function createPage(input: Partial<CmsPage>, userId?: string): Promise<CmsPage> {
  return mutateDb(async (db) => {
    const page: CmsPage = {
      id: createId('pg'),
      title: input.title || 'Untitled',
      slug: input.slug || slugify(input.title || 'page'),
      type: input.type || 'custom_page',
      content: input.content || '',
      featuredImage: input.featuredImage,
      status: input.status || 'draft',
      metaTitle: input.metaTitle || input.title || '',
      metaDescription: input.metaDescription || '',
      updatedAt: now()
    };
    db.pages.push(page);
    logAction(db, userId, 'settings_updated', 'pages', page.id, undefined, page);
    return page;
  });
}

export async function updatePage(id: string, updates: Partial<CmsPage>, userId?: string): Promise<CmsPage> {
  return mutateDb(async (db) => {
    const page = db.pages.find((p) => p.id === id || p.slug === id);
    if (!page || page.deletedAt) httpError('Page not found.', 404);
    Object.assign(page, updates, { id: page.id, updatedAt: now() });
    logAction(db, userId, 'settings_updated', 'pages', page.id);
    return page;
  });
}

export async function deletePage(id: string, userId?: string): Promise<boolean> {
  return mutateDb(async (db) => {
    const page = db.pages.find((p) => p.id === id || p.slug === id);
    if (!page) return false;
    page.deletedAt = now();
    page.status = 'archived';
    logAction(db, userId, 'settings_updated', 'pages', page.id);
    return true;
  });
}

export function listMedia(): MediaFile[] {
  return loadDb().media;
}

export async function addMedia(input: { filename: string; mimeType: string; url: string; folder?: string; size?: number }): Promise<MediaFile> {
  return mutateDb((db) => {
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'mp4', 'pdf'];
    const ext = input.filename.split('.').pop()?.toLowerCase() || '';
    if (!allowed.includes(ext)) httpError('Unsupported file type.', 400);
    if ((input.size || 0) > config.maxUploadBytes) httpError('File exceeds maximum size.', 400);
    const file: MediaFile = {
      id: createId('med'),
      filename: input.filename,
      mimeType: input.mimeType,
      url: input.url,
      folder: input.folder || 'general',
      size: input.size || 0,
      createdAt: now()
    };
    db.media.unshift(file);
    return file;
  });
}

export async function deleteMedia(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const before = db.media.length;
    db.media = db.media.filter((m) => m.id !== id);
    return db.media.length < before;
  });
}

export function getSettings(): WebsiteSettings {
  const s = loadDb().settings;
  const anyS = s as unknown as Record<string, unknown>;
  const websiteName = (anyS.website_name as string) || s.websiteName || 'Zippy';
  const backendName = (anyS.backend_name as string) || (anyS.backendName as string) || 'Zippy';

  const defaultNavItems: HeaderNavItem[] = [
    { id: 'nav-home', label: 'HOME', url: '/', slug: 'home', isHome: true },
    { id: 'nav-sale', label: 'SALE', url: '/shop/sale', slug: 'sale', highlight: true, badge: 'UP TO 35%' },
    { id: 'nav-new', label: 'NEW ARRIVALS', url: '/shop/new-arrivals', slug: 'new-arrivals' },
    { id: 'nav-blazer', label: 'BLAZER', url: '/shop/blazer', slug: 'blazer' },
    { id: 'nav-shirt', label: 'SHIRT', url: '/shop/shirt', slug: 'shirt' },
    { id: 'nav-polo', label: 'POLO', url: '/shop/polo', slug: 'polo' },
    { id: 'nav-pant', label: 'PANT', url: '/shop/pant', slug: 'pant' },
    { id: 'nav-ethnic', label: 'ETHNIC WEAR', url: '/shop/ethnic-wear', slug: 'ethnic-wear' },
    { id: 'nav-acc', label: 'ACCESSORIES', url: '/shop/accessories', slug: 'accessories' }
  ];

  const defaultPillars: FooterPillarItem[] = [
    {
      id: 'pillar-1',
      icon: 'truck',
      title: 'Complimentary Delivery',
      description: 'On all Dhaka orders exceeding ৳3,000. Nationwide courier dispatch.'
    },
    {
      id: 'pillar-2',
      icon: 'shield',
      title: 'Master Tailoring',
      description: 'Super 130s Italian wool, Egyptian Giza cotton, and artisanal cuts.'
    },
    {
      id: 'pillar-3',
      icon: 'refresh',
      title: '7-Day Boutique Exchange',
      description: 'Hassle-free size and style exchange across all flagship stores.'
    },
    {
      id: 'pillar-4',
      icon: 'phone',
      title: 'Dedicated Concierge',
      description: `Expert stylists available 7 days a week: ${s.phone || '+880 9612-742462'}.`
    }
  ];

  const defaultCol1Links: FooterLinkItem[] = [
    { id: 'col1-1', label: 'Italian Wool Blazers', url: '/shop/blazer' },
    { id: 'col1-2', label: 'Egyptian Giza Shirts', url: '/shop/shirt' },
    { id: 'col1-3', label: 'Festive Silk Panjabis', url: '/shop/ethnic-wear' },
    { id: 'col1-4', label: 'Mercerized Polos', url: '/shop/polo' },
    { id: 'col1-5', label: 'Tailored Trousers & Chinos', url: '/shop/pant' },
    { id: 'col1-6', label: 'Handmade Leather Oxfords', url: '/shop/accessories' },
    { id: 'col1-7', label: 'Sale Privileges', url: '/shop/sale', highlight: true }
  ];

  const defaultCol2Links: FooterLinkItem[] = [
    { id: 'col2-1', label: 'Track Order Status', url: '/track-order' },
    { id: 'col2-2', label: 'Bespoke Size Guide', url: '#size-guide' },
    { id: 'col2-3', label: 'Boutique Locator', url: '/stores' },
    { id: 'col2-4', label: 'The Atelier Heritage', url: '/about' },
    { id: 'col2-5', label: 'Shipping & Delivery', url: '/faq' },
    { id: 'col2-6', label: 'Return & Exchange Policy', url: '/returns' }
  ];

  const defaultPaymentBadges = ['CASH ON DELIVERY', 'bKash', 'SSLCOMMERZ', 'VISA / MASTERCARD'];

  return {
    ...s,
    website_name: websiteName,
    websiteName: websiteName,
    backend_name: backendName,
    backendName: backendName,
    favicon: (anyS.favicon as string) || (anyS.favicon_url as string) || s.favicon || '/favicon.ico',

    // Header fallbacks
    headerAnnouncementEnabled: s.headerAnnouncementEnabled !== undefined ? s.headerAnnouncementEnabled : true,
    headerAnnouncementText: s.headerAnnouncementText ?? 'Complimentary Dhaka Delivery on Orders Above ৳3,000',
    headerHotline: s.headerHotline ?? '+880 9612-742462',
    headerLocatorText: s.headerLocatorText ?? 'Atelier Locator',
    headerLocatorUrl: s.headerLocatorUrl ?? '/stores',
    headerTrackOrderText: s.headerTrackOrderText ?? 'Track Order',
    headerTrackOrderUrl: s.headerTrackOrderUrl ?? '/track-order',
    headerSticky: s.headerSticky !== undefined ? s.headerSticky : true,
    headerShowSearch: s.headerShowSearch !== undefined ? s.headerShowSearch : true,
    headerShowAccount: s.headerShowAccount !== undefined ? s.headerShowAccount : true,
    headerShowWishlist: s.headerShowWishlist !== undefined ? s.headerShowWishlist : true,
    headerShowCart: s.headerShowCart !== undefined ? s.headerShowCart : true,
    headerNavItems: s.headerNavItems && s.headerNavItems.length > 0 ? s.headerNavItems : defaultNavItems,

    // Footer fallbacks
    footerPillarsEnabled: s.footerPillarsEnabled !== undefined ? s.footerPillarsEnabled : true,
    footerPillars: s.footerPillars && s.footerPillars.length > 0 ? s.footerPillars : defaultPillars,
    footerTagline: s.footerTagline ?? "The Gentleman's Wardrobe",
    footerAboutText: s.footerAboutText ?? `Founded on the belief that sartorial refinement is an attitude, ${websiteName} curates bespoke blazers, pure Egyptian cotton shirts, executive polos, and festive ethnic wear for the distinguished gentlemen of Bangladesh.`,
    footerCol1Title: s.footerCol1Title ?? 'Collections',
    footerCol1Links: s.footerCol1Links && s.footerCol1Links.length > 0 ? s.footerCol1Links : defaultCol1Links,
    footerCol2Title: s.footerCol2Title ?? 'Client Services',
    footerCol2Links: s.footerCol2Links && s.footerCol2Links.length > 0 ? s.footerCol2Links : defaultCol2Links,
    footerNewsletterEnabled: s.footerNewsletterEnabled !== undefined ? s.footerNewsletterEnabled : true,
    footerNewsletterTitle: s.footerNewsletterTitle ?? 'Privilege Circle',
    footerNewsletterSubtitle: s.footerNewsletterSubtitle ?? 'Receive private invitations to preview seasonal collections and bespoke trunk shows.',
    footerCopyright: s.footerCopyright ?? `© {year} {brand} Bangladesh. All rights reserved. Refined luxury menswear.`,
    footerPaymentBadges: s.footerPaymentBadges && s.footerPaymentBadges.length > 0 ? s.footerPaymentBadges : defaultPaymentBadges
  };
}

export async function updateSettings(updates: Partial<WebsiteSettings> & Record<string, unknown>, userId?: string): Promise<WebsiteSettings> {
  return mutateDb(async (db) => {
    const old = { ...db.settings };
    const norm = { ...updates };
    if (updates.website_name && !updates.websiteName) norm.websiteName = updates.website_name;
    if (updates.websiteName && !updates.website_name) norm.website_name = updates.websiteName;
    if (updates.backend_name && !updates.backendName) norm.backendName = updates.backend_name;
    if (updates.backendName && !updates.backend_name) norm.backend_name = updates.backendName;
    if (updates.favicon_url && !updates.favicon) norm.favicon = updates.favicon_url as string;
    if (updates.favicon) norm.favicon = updates.favicon as string;
    db.settings = { ...db.settings, ...norm } as WebsiteSettings;
    logAction(db, userId, 'settings_updated', 'settings', 'website', old, db.settings);
    return getSettings();
  });
}

export function getSeo(): SeoSettings {
  const db = loadDb();
  const seo = db.seo;
  const anySeo = ((seo || {}) as unknown) as Record<string, unknown>;
  const anySettings = ((db.settings || {}) as unknown) as Record<string, unknown>;
  const brandName = (anySettings.website_name as string) || (anySettings.websiteName as string) || 'Zippy';
  const defaultTitle = `${brandName} | Luxury Bespoke Men's Fashion & Tailoring`;
  const defaultDesc = `Discover handcrafted suits, blazers, and luxury panjabis tailored for the modern gentleman by ${brandName} in Dhaka, Bangladesh.`;
  const defaultKeywords = `${brandName.toLowerCase()}, bespoke tailoring, menswear, suits bd, panjabi dhaka`;
  return {
    metaTitle: seo?.metaTitle || (anySeo.meta_title as string) || defaultTitle,
    metaDescription: seo?.metaDescription || (anySeo.meta_description as string) || defaultDesc,
    metaKeywords: seo?.metaKeywords || (anySeo.meta_keywords as string) || defaultKeywords,
    canonicalUrl: seo?.canonicalUrl || (anySeo.canonical_url as string) || "https://zippybd.com",
    openGraphImage: seo?.openGraphImage || (anySeo.og_image as string) || (anySeo.open_graph_image as string) || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200",
    robots: seo?.robots || (anySeo.robotsSettings as string) || "index, follow",
    schemaMarkup: seo?.schemaMarkup || ""
  };
}

export async function updateSeo(updates: Partial<SeoSettings> & Record<string, unknown>, userId?: string): Promise<SeoSettings> {
  return mutateDb(async (db) => {
    const norm: Partial<SeoSettings> = { ...updates };
    if (updates.meta_title && !updates.metaTitle) norm.metaTitle = updates.meta_title as string;
    if (updates.meta_description && !updates.metaDescription) norm.metaDescription = updates.meta_description as string;
    if (updates.meta_keywords && !updates.metaKeywords) norm.metaKeywords = updates.meta_keywords as string;
    if (updates.canonical_url && !updates.canonicalUrl) norm.canonicalUrl = updates.canonical_url as string;
    if (updates.og_image && !updates.openGraphImage) norm.openGraphImage = updates.og_image as string;
    if (updates.open_graph_image && !updates.openGraphImage) norm.openGraphImage = updates.open_graph_image as string;
    if (updates.robotsSettings && !updates.robots) norm.robots = updates.robotsSettings as string;
    db.seo = { ...db.seo, ...norm };
    logAction(db, userId, 'settings_updated', 'seo', 'seo', undefined, db.seo);
    return getSeo();
  });
}

export function listRedirects(): SeoRedirect[] {
  return loadDb().redirects;
}

export async function addRedirect(fromPath: string, toPath: string, statusCode: 301 | 302 = 301): Promise<SeoRedirect> {
  return mutateDb((db) => {
    const redirect: SeoRedirect = { id: createId('redir'), fromPath, toPath, statusCode };
    db.redirects.push(redirect);
    return redirect;
  });
}

export function sitemapXml(): string {
  const db = loadDb();
  const urls = [
    '/',
    ...notDeleted(db.products).map((p) => `/product/${p.slug}`),
    ...notDeleted(db.categories).map((c) => `/shop/${c.slug}`),
    ...notDeleted(db.pages).map((p) => `/${p.slug}`),
    ...notDeleted(db.blogPosts).map((p) => `/blog/${p.slug}`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>`;
}

export function listCustomers(includeDeleted = false): User[] {
  const users = loadDb().users.filter((u) => u.role === 'CUSTOMER');
  return (includeDeleted ? users : users.filter((u) => !u.deletedAt)).map(publicUser);
}

export function getCustomer(id: string): User | undefined {
  const user = loadDb().users.find((u) => u.id === id);
  return user ? publicUser(user) : undefined;
}

export async function updateCustomer(id: string, updates: Partial<User>, userId?: string): Promise<User> {
  return mutateDb(async (db) => {
    const user = db.users.find((u) => u.id === id);
    if (!user || user.deletedAt) httpError('Customer not found.', 404);
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.phone) user.phone = updates.phone;
    if (updates.status) user.status = updates.status;
    if (updates.profileImage) user.profileImage = updates.profileImage;
    user.updatedAt = now();
    logAction(db, userId, 'admin_updated', 'customers', id);
    return publicUser(user);
  });
}

export async function deleteCustomer(id: string, userId?: string): Promise<boolean> {
  return mutateDb(async (db) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return false;
    user.deletedAt = now();
    user.status = 'inactive';
    logAction(db, userId, 'admin_deleted', 'customers', id);
    return true;
  });
}

export function listReviewsAdmin(): ProductReview[] {
  return loadDb().reviews;
}

export async function moderateReview(id: string, status: 'approved' | 'rejected', adminReply?: string): Promise<ProductReview> {
  return mutateDb((db) => {
    const review = db.reviews.find((r) => r.id === id);
    if (!review) httpError('Review not found.', 404);
    review.status = status;
    if (adminReply) review.adminReply = adminReply;
    return review;
  });
}

export async function deleteReview(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const before = db.reviews.length;
    db.reviews = db.reviews.filter((r) => r.id !== id);
    return db.reviews.length < before;
  });
}

export function listInquiries(): ProductInquiry[] {
  return loadDb().inquiries;
}

export async function createInquiry(input: Omit<ProductInquiry, 'id' | 'createdAt' | 'status'>): Promise<ProductInquiry> {
  return mutateDb((db) => {
    const inquiry: ProductInquiry = {
      ...input,
      id: createId('inq'),
      status: 'pending',
      createdAt: now()
    };
    db.inquiries.unshift(inquiry);
    db.notifications.unshift({
      id: createId('ntf'),
      channel: 'email',
      event: 'new_inquiry',
      payload: { inquiryId: inquiry.id, productId: inquiry.productId },
      createdAt: now(),
      sent: false
    });
    return inquiry;
  });
}

export async function replyInquiry(id: string, adminReply: string): Promise<ProductInquiry> {
  return mutateDb((db) => {
    const inquiry = db.inquiries.find((i) => i.id === id);
    if (!inquiry) httpError('Inquiry not found.', 404);
    inquiry.adminReply = adminReply;
    inquiry.status = 'replied';
    return inquiry;
  });
}

export async function updateInquiryStatus(id: string, status: string): Promise<ProductInquiry> {
  return mutateDb((db) => {
    const inquiry = db.inquiries.find((i) => i.id === id);
    if (!inquiry) httpError('Inquiry not found.', 404);
    inquiry.status = status;
    return inquiry;
  });
}

export function listBlogPosts(): BlogPost[] {
  return notDeleted(loadDb().blogPosts);
}

export async function upsertBlog(input: Partial<BlogPost>, id?: string, userId?: string): Promise<BlogPost> {
  return mutateDb(async (db) => {
    if (id) {
      const post = db.blogPosts.find((p) => p.id === id);
      if (!post || post.deletedAt) httpError('Post not found.', 404);
      Object.assign(post, input, { id, updatedAt: now() });
      return post;
    }
    const post: BlogPost = {
      id: createId('blog'),
      title: input.title || 'Untitled',
      slug: input.slug || slugify(input.title || 'post'),
      excerpt: input.excerpt || '',
      content: input.content || '',
      featuredImage: input.featuredImage || '',
      authorId: input.authorId || userId || 'user-admin',
      categoryId: input.categoryId,
      tags: input.tags || [],
      status: input.status || 'draft',
      publishedAt: input.status === 'published' ? now() : input.publishedAt,
      metaTitle: input.metaTitle || input.title || '',
      metaDescription: input.metaDescription || '',
      createdAt: now(),
      updatedAt: now()
    };
    db.blogPosts.unshift(post);
    return post;
  });
}

export async function deleteBlog(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const post = db.blogPosts.find((p) => p.id === id);
    if (!post) return false;
    post.deletedAt = now();
    return true;
  });
}

export function listOffers(): Offer[] {
  return loadDb().offers;
}

export async function upsertOffer(input: Partial<Offer>, id?: string): Promise<Offer> {
  return mutateDb((db) => {
    if (id) {
      const offer = db.offers.find((o) => o.id === id);
      if (!offer) httpError('Offer not found.', 404);
      Object.assign(offer, input, { id, updatedAt: now() });
      return offer;
    }
    const offer: Offer = {
      id: createId('off'),
      name: input.name || 'Untitled offer',
      code: input.code,
      discountType: input.discountType || 'percentage_discount',
      discountValue: input.discountValue ?? 0,
      minimumOrderAmount: input.minimumOrderAmount ?? 0,
      maximumDiscount: input.maximumDiscount,
      usageLimit: input.usageLimit,
      perCustomerLimit: input.perCustomerLimit,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status || 'active',
      createdAt: now(),
      updatedAt: now()
    };
    db.offers.push(offer);
    return offer;
  });
}

export async function deleteOffer(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const before = db.offers.length;
    db.offers = db.offers.filter((o) => o.id !== id);
    return db.offers.length < before;
  });
}

export function listShipping(): ShippingMethod[] {
  return loadDb().shippingMethods;
}

export async function upsertShipping(input: Partial<ShippingMethod>, id?: string): Promise<ShippingMethod> {
  return mutateDb((db) => {
    if (id) {
      const method = db.shippingMethods.find((s) => s.id === id);
      if (!method) httpError('Shipping method not found.', 404);
      Object.assign(method, input, { id });
      return method;
    }
    const method: ShippingMethod = {
      id: createId('shp'),
      name: input.name || 'Standard',
      zone: input.zone || 'inside_dhaka',
      deliveryCharge: input.deliveryCharge ?? 80,
      estimatedDeliveryDays: input.estimatedDeliveryDays ?? 3,
      status: input.status || 'active'
    };
    db.shippingMethods.push(method);
    return method;
  });
}

export {
  listPaymentMethods,
  getPaymentMethod,
  upsertPaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
  testGatewayConnection,
  getPaymentGatewayStats,
  initiateGatewayPayment,
  verifyGatewayPayment,
  processGatewayRefund,
  handleGatewayWebhook
} from './paymentMethodService.ts';


export function listHomepage(): HomepageSection[] {
  return [...loadDb().homepageSections].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertHomepage(input: Partial<HomepageSection>, id?: string): Promise<HomepageSection> {
  return mutateDb((db) => {
    if (id) {
      const section = db.homepageSections.find((s) => s.id === id);
      if (!section) httpError('Section not found.', 404);
      Object.assign(section, input, { id });
      return section;
    }
    const section: HomepageSection = {
      id: createId('sec'),
      type: input.type || 'custom_html',
      title: input.title || 'Section',
      config: input.config || {},
      sortOrder: input.sortOrder ?? db.homepageSections.length + 1,
      status: input.status || 'published'
    };
    db.homepageSections.push(section);
    return section;
  });
}

export function getNavigation(): NavigationMenu[] {
  return loadDb().navigation;
}

export async function updateNavigation(menus: NavigationMenu[]): Promise<NavigationMenu[]> {
  return mutateDb((db) => {
    db.navigation = menus;
    return db.navigation;
  });
}

export function cmsDashboard() {
  const db = loadDb();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const sales = db.orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
  const totalSales = sales.reduce((s, o) => s + o.total, 0);
  const todaySales = sales.filter((o) => o.createdAt.slice(0, 10) === today).reduce((s, o) => s + o.total, 0);
  const monthlySales = sales.filter((o) => o.createdAt.slice(0, 7) === month).reduce((s, o) => s + o.total, 0);
  const productSales = new Map<string, { productId: string; name: string; qty: number; revenue: number }>();
  for (const order of sales) {
    for (const item of order.items) {
      const productRef = item.product || db.products.find(p => p.id === item.productId);
      const cur = productSales.get(item.productId) || {
        productId: item.productId,
        name: productRef?.name || item.productId,
        qty: 0,
        revenue: 0
      };
      cur.qty += item.quantity;
      cur.revenue += item.price * item.quantity;
      productSales.set(item.productId, cur);
    }
  }
  const pendingCount = db.orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const paidCount = db.orders.filter((o) => o.paymentStatus === 'PAID').length;
  const catalogCount = db.products.filter((p) => !p.deletedAt).length;
  const lowStockCount = lowStock().length;

  return {
    grossRevenue: totalSales,
    totalOrders: db.orders.length,
    pendingOrders: pendingCount,
    paidOrders: paidCount,
    catalogCount,
    lowStock: lowStockCount,
    stores: db.stores.length,

    total_sales: totalSales,
    today_sales: todaySales,
    monthly_sales: monthlySales,
    total_orders: db.orders.length,
    pending_orders: pendingCount,
    completed_orders: db.orders.filter((o) => o.status === 'DELIVERED').length,
    cancelled_orders: db.orders.filter((o) => o.status === 'CANCELLED').length,
    total_customers: db.users.filter((u) => u.role === 'CUSTOMER' && !u.deletedAt).length,
    total_products: catalogCount,
    low_stock_products: lowStockCount,
    out_of_stock_products: outOfStock().length,
    top_selling_products: [...productSales.values()].sort((a, b) => b.qty - a.qty).slice(0, 5),
    recent_orders: db.orders.slice(0, 8),
    recent_customers: listCustomers().slice(-5).reverse(),
    recent_reviews: db.reviews.slice(0, 5)
  };
}

export function salesReport(filter?: SalesReportFilter): SalesReportResult {
  const db = loadDb();
  const allOrders = (db.orders || []).filter((o) => !o.deletedAt);

  const fromDate = filter?.from ? filter.from.slice(0, 10) : undefined;
  const toDate = filter?.to ? filter.to.slice(0, 10) : undefined;
  const methodFilter = filter?.paymentMethod && filter.paymentMethod !== 'all' ? filter.paymentMethod.toLowerCase() : undefined;
  const statusFilter = filter?.status && filter.status !== 'all' ? filter.status.toLowerCase() : undefined;
  const searchTerm = filter?.search ? filter.search.trim().toLowerCase() : undefined;

  const filteredOrders = allOrders.filter((order) => {
    const orderDate = order.createdAt ? order.createdAt.slice(0, 10) : '';
    if (fromDate && orderDate < fromDate) return false;
    if (toDate && orderDate > toDate) return false;

    if (methodFilter && (order.paymentMethod || '').toLowerCase() !== methodFilter) {
      return false;
    }

    if (statusFilter && (order.status || '').toLowerCase() !== statusFilter) {
      return false;
    }

    if (searchTerm) {
      const matchNum = (order.orderNumber || '').toLowerCase().includes(searchTerm);
      const matchName = (order.customer?.name || '').toLowerCase().includes(searchTerm);
      const matchPhone = (order.customer?.phone || '').toLowerCase().includes(searchTerm);
      const matchEmail = (order.customer?.email || '').toLowerCase().includes(searchTerm);
      if (!matchNum && !matchName && !matchPhone && !matchEmail) {
        return false;
      }
    }

    return true;
  });

  const byDayMap = new Map<string, { date: string; orders: number; revenue: number; discount: number; netSales: number; itemsCount: number }>();
  const byPaymentMap = new Map<string, { method: string; count: number; revenue: number }>();
  const byStatusMap = new Map<string, { status: string; count: number; revenue: number }>();
  const productAggMap = new Map<string, { id: string; title: string; sku: string; quantity: number; revenue: number; image?: string }>();

  let totalRevenue = 0;
  let totalGross = 0;
  let totalDiscount = 0;
  let totalShipping = 0;
  let totalItemsCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let processingCount = 0;

  for (const order of filteredOrders) {
    const date = order.createdAt ? order.createdAt.slice(0, 10) : 'Unknown';
    const gross = (order.subtotal || order.total || 0);
    const disc = (order.discount || 0);
    const rev = (order.total || 0);
    const ship = (order.shippingFee || 0);
    const net = gross - disc;

    totalRevenue += rev;
    totalGross += gross;
    totalDiscount += disc;
    totalShipping += ship;

    const orderItemsQty = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
    totalItemsCount += orderItemsQty;

    const st = (order.status || 'pending').toLowerCase();
    if (st === 'delivered') completedCount++;
    else if (st === 'cancelled') cancelledCount++;
    else if (st === 'processing' || st === 'shipped') processingCount++;

    // byDay
    const curDay = byDayMap.get(date) || { date, orders: 0, revenue: 0, discount: 0, netSales: 0, itemsCount: 0 };
    curDay.orders += 1;
    curDay.revenue += rev;
    curDay.discount += disc;
    curDay.netSales += net;
    curDay.itemsCount += orderItemsQty;
    byDayMap.set(date, curDay);

    // byPaymentMethod
    const pMethod = (order.paymentMethod || 'cod').toUpperCase();
    const curPay = byPaymentMap.get(pMethod) || { method: pMethod, count: 0, revenue: 0 };
    curPay.count += 1;
    curPay.revenue += rev;
    byPaymentMap.set(pMethod, curPay);

    // byStatus
    const curStatus = byStatusMap.get(st) || { status: st, count: 0, revenue: 0 };
    curStatus.count += 1;
    curStatus.revenue += rev;
    byStatusMap.set(st, curStatus);

    // products
    for (const item of (order.items || [])) {
      const pId = item.productId || item.product?.id || 'unknown';
      const title = item.product?.name || item.product?.styleCode || 'Luxury Garment';
      const sku = item.product?.sku || 'SKU';
      const qty = item.quantity || 1;
      const itemRev = (item.price || item.product?.price || 0) * qty;
      const img = item.product?.images?.[0];

      const curProd = productAggMap.get(pId) || { id: pId, title, sku, quantity: 0, revenue: 0, image: img };
      curProd.quantity += qty;
      curProd.revenue += itemRev;
      if (!curProd.image && img) curProd.image = img;
      productAggMap.set(pId, curProd);
    }
  }

  const byPaymentMethod = [...byPaymentMap.values()].map((p) => ({
    ...p,
    percentage: totalRevenue > 0 ? Math.round((p.revenue / totalRevenue) * 100) : 0
  })).sort((a, b) => b.revenue - a.revenue);

  const byStatus = [...byStatusMap.values()].sort((a, b) => b.count - a.count);

  const topProducts = [...productAggMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const ordersList = [...filteredOrders]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber || o.id,
      createdAt: o.createdAt,
      customerName: o.customer?.name || 'Walk-in Patron',
      customerPhone: o.customer?.phone || '',
      customerEmail: o.customer?.email || '',
      customerCity: o.customer?.city || '',
      itemsCount: (o.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0),
      subtotal: o.subtotal || o.total || 0,
      discount: o.discount || 0,
      shippingFee: o.shippingFee || 0,
      total: o.total || 0,
      status: o.status || 'pending',
      paymentStatus: o.paymentStatus || 'pending',
      paymentMethod: (o.paymentMethod || 'cod').toUpperCase()
    }));

  const byDay = [...byDayMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  return {
    totals: {
      orders: filteredOrders.length,
      revenue: totalRevenue,
      discount: totalDiscount,
      grossSales: totalGross,
      netSales: totalGross - totalDiscount,
      shippingFee: totalShipping,
      averageOrderValue: filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0,
      itemsCount: totalItemsCount,
      completedOrdersCount: completedCount,
      cancelledOrdersCount: cancelledCount,
      processingOrdersCount: processingCount
    },
    byDay,
    byPaymentMethod,
    byStatus,
    topProducts,
    orders: ordersList,
    filter: filter || {}
  };
}

export function inventoryReport() {
  const items = loadDb().inventory;
  const valuation = items.reduce((s, i) => {
    const product = loadDb().products.find((p) => p.id === i.productId);
    const unit = product?.costPrice ?? product?.salePrice ?? product?.price ?? 0;
    return s + unit * i.quantity;
  }, 0);
  return {
    skuCount: items.length,
    units: items.reduce((s, i) => s + i.quantity, 0),
    reserved: items.reduce((s, i) => s + i.reservedQuantity, 0),
    valuation,
    lowStock: lowStock(),
    outOfStock: outOfStock()
  };
}

export function ordersReport() {
  const db = loadDb();
  const byStatus: Record<string, number> = {};
  for (const order of db.orders) {
    byStatus[order.status] = (byStatus[order.status] || 0) + 1;
  }
  return { total: db.orders.length, byStatus, recent: db.orders.slice(0, 20) };
}

export function customersReport() {
  const customers = listCustomers();
  const db = loadDb();
  return {
    total: customers.length,
    verified: db.users.filter((u) => u.role === 'CUSTOMER' && u.emailVerified).length,
    recent: customers.slice(-10).reverse()
  };
}

export function listAuditLogs() {
  return loadDb().auditLogs;
}

export function listNotifications() {
  return loadDb().notifications;
}

export function listRoles(): RoleRecord[] {
  return loadDb().roles;
}

export function listAdmins(): User[] {
  return loadDb()
    .users.filter((u) => u.role === 'ADMIN' && !u.deletedAt)
    .map(publicUser);
}

export async function createAdmin(
  input: { name: string; email: string; phone: string; password: string; roleId?: string },
  actorId?: string
): Promise<User> {
  return mutateDb(async (db) => {
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      httpError('An account with this email already exists.', 409);
    }
    const role = db.roles.find((r) => r.id === input.roleId) || db.roles.find((r) => r.name === 'admin');
    const names = input.name.trim().split(/\s+/);
    const user: AuthUser = {
      id: createId('adm'),
      fullName: input.name,
      firstName: names[0],
      lastName: names.slice(1).join(' ') || names[0],
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: 'ADMIN',
      roleId: role?.id,
      adminRole: role?.name,
      status: 'active',
      emailVerified: true,
      createdAt: now(),
      updatedAt: now(),
      passwordHash: bcrypt.hashSync(input.password, config.bcryptRounds),
      savedAddresses: []
    };
    db.users.push(user);
    logAction(db, actorId, 'admin_created', 'admins', user.id, undefined, { email: user.email, role: role?.name });
    return publicUser(user);
  });
}

export async function updateAdmin(id: string, updates: Partial<User> & { password?: string; roleId?: string }, actorId?: string) {
  return mutateDb(async (db) => {
    const user = db.users.find((u) => u.id === id && u.role === 'ADMIN');
    if (!user) httpError('Admin not found.', 404);
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.phone) user.phone = updates.phone;
    if (updates.status) user.status = updates.status;
    if (updates.roleId) {
      const role = db.roles.find((r) => r.id === updates.roleId);
      if (role) {
        user.roleId = role.id;
        user.adminRole = role.name;
      }
    }
    if (updates.password) user.passwordHash = bcrypt.hashSync(updates.password, config.bcryptRounds);
    user.updatedAt = now();
    logAction(db, actorId, 'admin_updated', 'admins', id);
    return publicUser(user);
  });
}

export async function deleteAdmin(id: string, actorId?: string) {
  return mutateDb(async (db) => {
    const user = db.users.find((u) => u.id === id && u.role === 'ADMIN');
    if (!user) return false;
    user.deletedAt = now();
    user.status = 'inactive';
    logAction(db, actorId, 'admin_deleted', 'admins', id);
    return true;
  });
}

export function listPayments() {
  return loadDb().payments;
}

export function listVariants(productId?: string): ProductVariant[] {
  const variants = loadDb().productVariants;
  return productId ? variants.filter((v) => v.productId === productId) : variants;
}

export function getCategory(idOrSlug: string): Category | undefined {
  const key = idOrSlug.toLowerCase();
  return loadDb().categories.find((c) => !c.deletedAt && (c.id.toLowerCase() === key || c.slug.toLowerCase() === key));
}

export async function toggleCategoryVisibility(id: string, active?: boolean, userId?: string): Promise<Category> {
  return mutateDb((db) => {
    const category = db.categories.find((c) => c.id === id || c.slug === id);
    if (!category || category.deletedAt) httpError('Category not found.', 404);
    const newStatus = active != null ? (active ? 'active' : 'inactive') : category.status === 'active' ? 'inactive' : 'active';
    category.status = newStatus;
    category.updatedAt = now();
    logAction(db, userId, 'category_updated', 'categories', category.id, undefined, { status: newStatus });
    return category;
  });
}

export function listCategoryProducts(categoryId: string): Product[] {
  const cat = getCategory(categoryId);
  const targetId = cat ? cat.id : categoryId;
  return loadDb().products.filter((p) => !p.deletedAt && (p.categoryId === targetId || p.subcategoryId === targetId));
}

export function listSubcategories(parentId: string): Category[] {
  const parent = getCategory(parentId);
  const targetId = parent ? parent.id : parentId;
  return loadDb().categories.filter((c) => !c.deletedAt && c.parentId === targetId);
}

export function getBrand(idOrSlug: string): Brand | undefined {
  const key = idOrSlug.toLowerCase();
  return loadDb().brands.find((b) => !b.deletedAt && (b.id.toLowerCase() === key || b.slug.toLowerCase() === key));
}

export function listBrandProducts(brandId: string): Product[] {
  const brand = getBrand(brandId);
  const targetId = brand ? brand.id : brandId;
  const targetSlug = brand ? brand.slug : brandId;
  const targetName = brand ? brand.name : brandId;
  return loadDb().products.filter(
    (p) =>
      !p.deletedAt &&
      (p.brandId === targetId ||
        p.brandId === targetSlug ||
        p.brandId === targetName ||
        (p as any).brand === targetName ||
        (p as any).brand === targetSlug)
  );
}

export async function bulkUpdateProducts(
  ids: string[],
  updates: Partial<Product>,
  userId?: string
): Promise<{ updatedCount: number; updated: Product[] }> {
  return mutateDb((db) => {
    const updated: Product[] = [];
    for (const id of ids) {
      const product = db.products.find((p) => p.id === id && !p.deletedAt);
      if (product) {
        Object.assign(product, updates, { updatedAt: now() });
        updated.push(product);
      }
    }
    logAction(db, userId, 'product_updated', 'products', undefined, undefined, { count: updated.length, updates });
    return { updatedCount: updated.length, updated };
  });
}

export async function setPrimaryProductImage(productId: string, imageId: string, userId?: string): Promise<ProductImage> {
  return mutateDb((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) httpError('Product not found.', 404);
    const images = db.productImages.filter((img) => img.productId === productId);
    const target = images.find((img) => img.id === imageId || img.url === imageId);
    if (!target) httpError('Image not found.', 404);

    for (const img of images) {
      img.isPrimary = img.id === target.id;
    }
    const primaryUrl = target.url;
    product.images = [primaryUrl, ...product.images.filter((u) => u !== primaryUrl)];
    product.updatedAt = now();
    logAction(db, userId, 'product_updated', 'products', productId, undefined, { primaryImage: target.id });
    return target;
  });
}

export async function reorderProductImages(productId: string, imageIds: string[], userId?: string): Promise<ProductImage[]> {
  return mutateDb((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) httpError('Product not found.', 404);
    const images = db.productImages.filter((img) => img.productId === productId);
    imageIds.forEach((id, idx) => {
      const match = images.find((img) => img.id === id || img.url === id);
      if (match) {
        match.sortOrder = idx;
      }
    });
    const sorted = images.sort((a, b) => a.sortOrder - b.sortOrder);
    product.images = sorted.map((img) => img.url);
    product.updatedAt = now();
    logAction(db, userId, 'product_updated', 'products', productId, undefined, { reordered: imageIds });
    return sorted;
  });
}

export function getVariant(variantId: string): ProductVariant | undefined {
  return loadDb().productVariants.find((v) => v.variantId === variantId);
}

export async function createVariant(
  productId: string,
  input: Partial<ProductVariant>,
  userId?: string
): Promise<ProductVariant> {
  return mutateDb((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) httpError('Product not found.', 404);
    const variant: ProductVariant = {
      variantId: createId('var'),
      productId,
      variantName: input.variantName || 'Default Variant',
      sku: input.sku || `${product.sku}-${Date.now().toString(36)}`,
      price: input.price ?? product.price,
      salePrice: input.salePrice,
      stockQuantity: input.stockQuantity ?? 0,
      image: input.image || (product.images[0] || ''),
      status: input.status || 'active'
    };
    db.productVariants.push(variant);
    logAction(db, userId, 'product_updated', 'products', productId, undefined, { variantCreated: variant.variantId });
    return variant;
  });
}

export async function updateVariant(
  variantId: string,
  updates: Partial<ProductVariant>,
  userId?: string
): Promise<ProductVariant> {
  return mutateDb((db) => {
    const variant = db.productVariants.find((v) => v.variantId === variantId);
    if (!variant) httpError('Variant not found.', 404);
    Object.assign(variant, updates, { variantId });
    logAction(db, userId, 'product_updated', 'products', variant.productId, undefined, { variantUpdated: variantId });
    return variant;
  });
}

export async function deleteVariant(variantId: string, userId?: string): Promise<boolean> {
  return mutateDb((db) => {
    const index = db.productVariants.findIndex((v) => v.variantId === variantId);
    if (index === -1) return false;
    const [deleted] = db.productVariants.splice(index, 1);
    logAction(db, userId, 'product_updated', 'products', deleted.productId, undefined, { variantDeleted: variantId });
    return true;
  });
}

export function getWarehouse(id: string): Warehouse | undefined {
  return loadDb().warehouses.find((w) => w.id === id || w.code === id);
}

export async function deleteWarehouse(id: string, userId?: string): Promise<boolean> {
  return mutateDb((db) => {
    const index = db.warehouses.findIndex((w) => w.id === id);
    if (index === -1) return false;
    db.warehouses.splice(index, 1);
    logAction(db, userId, 'settings_updated', 'warehouses', id);
    return true;
  });
}

export async function transferInventory(input: {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  note?: string;
  reference?: string;
  userId?: string;
}): Promise<{ sourceItem: InventoryItem; targetItem: InventoryItem; txns: InventoryTransaction[] }> {
  return mutateDb((db) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity, note, reference, userId } = input;
    if (fromWarehouseId === toWarehouseId) httpError('Source and destination warehouses cannot be the same.', 400);
    const sourceItem = db.inventory.find((i) => i.productId === productId && i.warehouseId === fromWarehouseId);
    if (!sourceItem || sourceItem.availableQuantity < quantity) {
      httpError('Insufficient available stock in source warehouse.', 400);
    }
    let targetItem = db.inventory.find((i) => i.productId === productId && i.warehouseId === toWarehouseId);
    if (!targetItem) {
      targetItem = {
        id: createId('inv'),
        productId,
        warehouseId: toWarehouseId,
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        minimumStock: sourceItem.minimumStock,
        maximumStock: sourceItem.maximumStock,
        updatedAt: now()
      };
      db.inventory.push(targetItem);
    }

    sourceItem.quantity -= quantity;
    sourceItem.availableQuantity = Math.max(0, sourceItem.quantity - sourceItem.reservedQuantity);
    sourceItem.updatedAt = now();

    targetItem.quantity += quantity;
    targetItem.availableQuantity = Math.max(0, targetItem.quantity - targetItem.reservedQuantity);
    targetItem.updatedAt = now();

    const txnOut: InventoryTransaction = {
      id: createId('itx'),
      productId,
      warehouseId: fromWarehouseId,
      type: 'transfer',
      quantity: -quantity,
      reference: reference || `TRF-OUT->${toWarehouseId}`,
      note: note || `Transferred to warehouse ${toWarehouseId}`,
      createdBy: userId || 'system',
      createdAt: now()
    };

    const txnIn: InventoryTransaction = {
      id: createId('itx'),
      productId,
      warehouseId: toWarehouseId,
      type: 'transfer',
      quantity: quantity,
      reference: reference || `TRF-IN<-${fromWarehouseId}`,
      note: note || `Transferred from warehouse ${fromWarehouseId}`,
      createdBy: userId || 'system',
      createdAt: now()
    };

    db.inventoryTransactions.unshift(txnOut, txnIn);
    logAction(db, userId, 'inventory_updated', 'inventory', productId, undefined, { from: fromWarehouseId, to: toWarehouseId, quantity });
    return { sourceItem, targetItem, txns: [txnOut, txnIn] };
  });
}

export function stockValuation() {
  const db = loadDb();
  const byProduct: Array<{
    id: string;
    name: string;
    sku: string;
    units: number;
    costPrice: number;
    sellingPrice: number;
    inventoryValue: number;
    costValue: number;
  }> = [];

  let totalValue = 0;
  let totalCost = 0;
  let totalUnits = 0;

  for (const product of db.products.filter((p) => !p.deletedAt)) {
    const invItems = db.inventory.filter((i) => i.productId === product.id);
    const units = invItems.length > 0 ? invItems.reduce((s, i) => s + i.quantity, 0) : Object.values(product.stock || {}).reduce((s, q) => s + q, 0);
    const cost = product.costPrice ?? Math.round(product.price * 0.5);
    const price = product.salePrice ?? product.price;
    const invVal = units * price;
    const costVal = units * cost;

    totalUnits += units;
    totalValue += invVal;
    totalCost += costVal;

    byProduct.push({
      id: product.id,
      name: product.name,
      sku: product.sku,
      units,
      costPrice: cost,
      sellingPrice: price,
      inventoryValue: invVal,
      costValue: costVal
    });
  }

  return {
    totalUnits,
    totalValue,
    totalCost,
    potentialProfit: totalValue - totalCost,
    byProduct
  };
}

export function listInventoryTransactions(query?: { type?: string; productId?: string; warehouseId?: string }): InventoryTransaction[] {
  const db = loadDb();
  let txns = db.inventoryTransactions || [];
  if (query?.type && query.type !== 'all') txns = txns.filter((t) => t.type === query.type);
  if (query?.productId) txns = txns.filter((t) => t.productId === query.productId);
  if (query?.warehouseId && query.warehouseId !== 'all') txns = txns.filter((t) => t.warehouseId === query.warehouseId);

  const productMap = new Map(db.products.map((p) => [p.id, p]));
  const warehouseMap = new Map(db.warehouses.map((w) => [w.id, w.name]));

  return txns.map((t) => {
    const product = productMap.get(t.productId);
    return {
      ...t,
      productName: product?.name || 'Unknown Garment',
      sku: product?.sku || 'N/A',
      warehouseName: warehouseMap.get(t.warehouseId) || t.warehouseId
    };
  });
}

export function getBanner(id: string): Banner | undefined {
  return loadDb().banners.find((b) => !b.deletedAt && b.id === id);
}

export async function setBannerStatus(id: string, status: RecordStatus, userId?: string): Promise<Banner> {
  return updateBanner(id, { status }, userId);
}

export async function reorderBanners(ids: string[], userId?: string): Promise<Banner[]> {
  return mutateDb((db) => {
    ids.forEach((id, idx) => {
      const banner = db.banners.find((b) => b.id === id);
      if (banner) banner.sortOrder = idx + 1;
    });
    const sorted = [...db.banners].filter((b) => !b.deletedAt).sort((a, b) => a.sortOrder - b.sortOrder);
    logAction(db, userId, 'banner_updated', 'banners', undefined, undefined, { reordered: ids });
    return sorted;
  });
}

export function getHomepageSection(id: string): HomepageSection | undefined {
  return loadDb().homepageSections.find((s) => s.id === id);
}

export async function deleteHomepageSection(id: string, userId?: string): Promise<boolean> {
  return mutateDb((db) => {
    const idx = db.homepageSections.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    db.homepageSections.splice(idx, 1);
    logAction(db, userId, 'settings_updated', 'homepage', id);
    return true;
  });
}

export async function reorderHomepageSections(ids: string[], userId?: string): Promise<HomepageSection[]> {
  return mutateDb((db) => {
    ids.forEach((id, idx) => {
      const sec = db.homepageSections.find((s) => s.id === id);
      if (sec) sec.sortOrder = idx + 1;
    });
    const sorted = [...db.homepageSections].sort((a, b) => a.sortOrder - b.sortOrder);
    logAction(db, userId, 'settings_updated', 'homepage', undefined, undefined, { reordered: ids });
    return sorted;
  });
}

export function getOffer(id: string): Offer | undefined {
  return loadDb().offers.find((o) => o.id === id || o.code === id);
}

export function getCoupon(codeOrId: string): Coupon | undefined {
  const key = codeOrId.toUpperCase();
  return loadDb().coupons.find((c) => c.code.toUpperCase() === key);
}

export async function updateCoupon(codeOrId: string, updates: Partial<Coupon>): Promise<Coupon> {
  return mutateDb((db) => {
    const key = codeOrId.toUpperCase();
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === key);
    if (!coupon) httpError('Coupon not found.', 404);
    Object.assign(coupon, updates);
    return coupon;
  });
}

export async function createCustomerAdmin(
  input: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    password?: string;
    profileImage?: string;
    dateOfBirth?: string;
    gender?: string;
    status?: 'active' | 'inactive' | 'blocked';
  },
  actorId?: string
): Promise<User> {
  return mutateDb(async (db) => {
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      httpError('A customer with this email already exists.', 409);
    }
    const fullName = input.fullName || [input.firstName, input.lastName].filter(Boolean).join(' ') || 'Customer';
    const names = fullName.trim().split(/\s+/);
    const pwd = input.password || 'Zippy@2026';
    const user: AuthUser = {
      id: createId('usr'),
      fullName,
      firstName: input.firstName || names[0],
      lastName: input.lastName || names.slice(1).join(' ') || '',
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: 'CUSTOMER',
      status: input.status || 'active',
      profileImage: input.profileImage || '',
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      emailVerified: true,
      phoneVerified: true,
      createdAt: now(),
      updatedAt: now(),
      passwordHash: bcrypt.hashSync(pwd, config.bcryptRounds),
      savedAddresses: []
    };
    db.users.push(user);
    logAction(db, actorId, 'customer_created', 'customers', user.id, undefined, { email: user.email });
    return publicUser(user);
  });
}

export function listCustomerAddresses(customerId: string): SavedAddress[] {
  const user = loadDb().users.find((u) => u.id === customerId);
  return user ? user.savedAddresses : [];
}

export async function addCustomerAddress(customerId: string, address: Omit<SavedAddress, 'id'>): Promise<SavedAddress> {
  return mutateDb((db) => {
    const user = db.users.find((u) => u.id === customerId);
    if (!user) httpError('Customer not found.', 404);
    const newAddress: SavedAddress = {
      id: createId('addr'),
      ...address,
      isDefault: address.isDefault ?? user.savedAddresses.length === 0
    };
    if (newAddress.isDefault) {
      for (const a of user.savedAddresses) a.isDefault = false;
    }
    user.savedAddresses.push(newAddress);
    user.updatedAt = now();
    return newAddress;
  });
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  updates: Partial<SavedAddress>
): Promise<SavedAddress> {
  return mutateDb((db) => {
    const user = db.users.find((u) => u.id === customerId);
    if (!user) httpError('Customer not found.', 404);
    const addr = user.savedAddresses.find((a) => a.id === addressId);
    if (!addr) httpError('Address not found.', 404);
    if (updates.isDefault) {
      for (const a of user.savedAddresses) a.isDefault = false;
    }
    Object.assign(addr, updates, { id: addressId });
    user.updatedAt = now();
    return addr;
  });
}

export async function deleteCustomerAddress(customerId: string, addressId: string): Promise<boolean> {
  return mutateDb((db) => {
    const user = db.users.find((u) => u.id === customerId);
    if (!user) return false;
    const len = user.savedAddresses.length;
    user.savedAddresses = user.savedAddresses.filter((a) => a.id !== addressId);
    user.updatedAt = now();
    return user.savedAddresses.length < len;
  });
}

export async function setDefaultCustomerAddress(customerId: string, addressId: string): Promise<SavedAddress> {
  return updateCustomerAddress(customerId, addressId, { isDefault: true });
}

export function getCustomerOrders(customerIdOrEmail: string): Order[] {
  const db = loadDb();
  const user = db.users.find((u) => u.id === customerIdOrEmail);
  const email = (user ? user.email : customerIdOrEmail).toLowerCase();
  return db.orders.filter((o) => o.customer.email.toLowerCase() === email || o.customerId === customerIdOrEmail);
}

export function getCustomerWishlist(customerId: string): Product[] {
  const db = loadDb();
  const productIds = db.wishlists[customerId] || [];
  return db.products.filter((p) => !p.deletedAt && productIds.includes(p.id));
}

export function generateInvoice(orderId: string) {
  const db = loadDb();
  const rawKey = (orderId || '').trim().toLowerCase();
  const cleanKey = rawKey.replace(/[^a-z0-9]/g, '').replace(/^(rm|inv|order)/, '');
  const order = db.orders.find((o) => {
    const oId = (o.id || '').toLowerCase();
    const oNum = (o.orderNumber || '').toLowerCase();
    if (oId === rawKey || oNum === rawKey) return true;
    const oClean = oNum.replace(/[^a-z0-9]/g, '').replace(/^(rm|inv|order)/, '');
    return cleanKey.length >= 3 && (oClean === cleanKey || oClean.includes(cleanKey));
  });
  if (!order) httpError('Order not found.', 404);
  const company = db.settings;
  const brandName = (company.websiteName || 'ZIPPY').toUpperCase();
  const invoiceNumber = `INV-${order.orderNumber.replace(/^RM-/, '')}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const paymentStatus = (order.paymentStatus || 'PENDING').toUpperCase();
  const orderStatus = (order.status || 'PENDING').toUpperCase();
  const isPaid = paymentStatus === 'PAID' || orderStatus === 'DELIVERED';
  const statusBadgeClass = isPaid ? 'status-paid' : orderStatus === 'CANCELLED' ? 'status-cancelled' : 'status-pending';

  const subtotal = order.subtotal || 0;
  const discount = order.discount || 0;
  const couponDiscount = order.couponDiscount || 0;
  const shippingFee = order.shippingFee || 0;
  const grandTotal = order.total || (subtotal - discount - couponDiscount + shippingFee);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.orderNumber} - ${brandName}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }

    html, body {
      background-color: #f3f4f6;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Screen Action Bar (hidden when printing) */
    .screen-toolbar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: #111827;
      color: #f9fafb;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
    }
    .toolbar-info {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      font-weight: 500;
    }
    .toolbar-tag {
      background: #10b981;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .t-btn {
      cursor: pointer;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .t-btn-primary {
      background: #d4af37;
      color: #000000;
    }
    .t-btn-primary:hover {
      background: #c59f2d;
    }
    .t-btn-secondary {
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
    }
    .t-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.22);
    }

    /* 1-Page Master Sheet Container */
    .sheet-wrapper {
      max-width: 820px;
      margin: 16px auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 24px 28px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    /* Header */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 12px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #111827;
      text-transform: uppercase;
      line-height: 1;
    }
    .brand-sub {
      font-size: 9px;
      letter-spacing: 1.5px;
      color: #9ca3af;
      text-transform: uppercase;
      margin-top: 3px;
      font-weight: 600;
    }
    .company-meta {
      font-size: 10.5px;
      color: #4b5563;
      margin-top: 6px;
      line-height: 1.35;
    }

    .doc-meta {
      text-align: right;
    }
    .doc-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #111827;
      line-height: 1;
      text-transform: uppercase;
    }
    .meta-details {
      margin-top: 6px;
      font-size: 11px;
      line-height: 1.4;
      color: #374151;
    }
    .meta-details strong {
      color: #111827;
    }

    .status-badge {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }

    /* Client & Delivery Info */
    .party-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 12px 0;
      padding: 10px 14px;
      background: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 6px;
    }
    .party-block h4 {
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin-bottom: 3px;
      font-weight: 700;
    }
    .party-block p {
      font-size: 11px;
      color: #374151;
      line-height: 1.35;
    }
    .party-block p strong {
      color: #111827;
      font-size: 11.5px;
    }

    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .items-table th {
      background: #111827;
      color: #ffffff;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 6px 10px;
      text-align: left;
      font-weight: 700;
    }
    .items-table th.center { text-align: center; }
    .items-table th.right { text-align: right; }

    .items-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 10.5px;
      vertical-align: middle;
      color: #1f2937;
    }
    .items-table td.center { text-align: center; }
    .items-table td.right { text-align: right; }

    .items-table tbody tr:nth-child(even) {
      background-color: #fbfbfb;
    }
    .item-title {
      font-weight: 700;
      color: #111827;
      font-size: 11px;
    }
    .item-sku {
      color: #6b7280;
      font-size: 9px;
      font-family: monospace;
      margin-top: 1px;
    }

    /* Settlement Summary */
    .settlement-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 8px;
      gap: 16px;
    }
    .terms-box {
      flex: 1;
      font-size: 9.5px;
      color: #4b5563;
      line-height: 1.4;
      padding: 8px 12px;
      border-left: 2px solid #d4af37;
      background: #fdfdf9;
    }
    .terms-box strong {
      color: #111827;
    }

    .totals-box {
      width: 270px;
      flex-shrink: 0;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }
    .totals-table td {
      padding: 3px 0;
      color: #4b5563;
    }
    .totals-table td.amount {
      text-align: right;
      font-weight: 600;
      color: #111827;
    }
    .totals-table tr.grand-row td {
      padding-top: 6px;
      padding-bottom: 6px;
      border-top: 1.5px solid #111827;
      border-bottom: 1.5px solid #111827;
      font-size: 12.5px;
      font-weight: 800;
      color: #111827;
    }
    .totals-table tr.grand-row td.amount {
      color: #111827;
      font-size: 13.5px;
    }

    /* Footer Stamp */
    .invoice-footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px dashed #d1d5db;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #6b7280;
    }
    .footer-left {
      line-height: 1.35;
    }
    .footer-right {
      text-align: right;
      font-style: italic;
      color: #4b5563;
    }

    /* Print Guarantee: Strict Single-Page */
    @media print {
      .no-print {
        display: none !important;
      }
      html, body {
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        overflow: visible !important;
      }
      .sheet-wrapper {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      table, tr, td, th {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .invoice-header, .party-grid, .settlement-wrap, .invoice-footer {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <!-- Screen Navigation / Print Bar -->
  <div class="screen-toolbar no-print">
    <div class="toolbar-info">
      <span>${brandName} Atelier Official Invoice</span>
      <span class="toolbar-tag">1-Page Print Ready</span>
      <span style="color:#9ca3af; font-size:11px;">#${order.orderNumber}</span>
    </div>
    <div class="toolbar-actions">
      <button onclick="window.print()" class="t-btn t-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
      <button onclick="window.close()" class="t-btn t-btn-secondary">Close Window</button>
    </div>
  </div>

  <div class="sheet-wrapper">
    <!-- Header -->
    <div class="invoice-header">
      <div class="brand-section">
        <div class="brand-title">${brandName}</div>
        <div class="brand-sub">Official Tax Invoice &bull; Sartorial Atelier</div>
        <div class="company-meta">
          ${company.address || 'Gulshan 1, Dhaka, Bangladesh'}<br>
          Phone: ${company.phone || '+880 1711-000001'} &bull; Email: ${company.email || 'support@zippy.com.bd'}
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-title">INVOICE</div>
        <div class="meta-details">
          <strong>Invoice #:</strong> ${invoiceNumber}<br>
          <strong>Order Ref:</strong> ${order.orderNumber}<br>
          <strong>Date:</strong> ${invoiceDate}<br>
          <strong>Status:</strong> <span class="status-badge ${statusBadgeClass}">${orderStatus}</span><br>
          <strong>Payment:</strong> ${order.paymentMethod || 'COD'} (${paymentStatus})
        </div>
      </div>
    </div>

    <!-- Client & Delivery Details -->
    <div class="party-grid">
      <div class="party-block">
        <h4>Billed To</h4>
        <p>
          <strong>${order.customer?.fullName || 'Valued Patron'}</strong><br>
          Phone: ${order.customer?.phone || 'N/A'}<br>
          Email: ${order.customer?.email || 'N/A'}
        </p>
      </div>
      <div class="party-block">
        <h4>Shipping Destination</h4>
        <p>
          ${order.customer?.address || 'Standard Delivery'}<br>
          ${order.customer?.district ? `${order.customer.district}, ` : ''}${order.customer?.division || ''}<br>
          Delivery Mode: Express Courier Dispatch
        </p>
      </div>
    </div>

    <!-- Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 38px;">#</th>
          <th>Item Description</th>
          <th class="center" style="width: 65px;">Size</th>
          <th class="center" style="width: 85px;">Color</th>
          <th class="center" style="width: 50px;">Qty</th>
          <th class="right" style="width: 90px;">Unit Price</th>
          <th class="right" style="width: 95px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
      .map(
        (item, index) => `<tr>
          <td style="color:#6b7280; font-size:10px;">${index + 1}</td>
          <td>
            <div class="item-title">${item.product?.name || 'Garment Piece'}</div>
            <div class="item-sku">SKU: ${item.product?.sku || 'N/A'}</div>
          </td>
          <td class="center">${item.size || 'Regular'}</td>
          <td class="center">${(typeof item.color === 'object' && item.color ? item.color.name : item.color) || 'Standard'}</td>
          <td class="center">${item.quantity}</td>
          <td class="right">&#2547;${Number(item.price || 0).toLocaleString()}</td>
          <td class="right" style="font-weight:700;">&#2547;${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
        </tr>`
      )
      .join('')}
      </tbody>
    </table>

    <!-- Financial Settlement & Terms -->
    <div class="settlement-wrap">
      <div class="terms-box">
        <strong>Terms & Customer Protection:</strong><br>
        1. Complimentary size alteration & exchange available within 7 days in pristine condition.<br>
        2. Present this tax invoice at any flagship store or contact our concierge hotline.<br>
        3. For support or order inquiries, reach us at ${company.email || 'support@zippy.com.bd'}.
      </div>

      <div class="totals-box">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td class="amount">&#2547;${subtotal.toLocaleString()}</td>
          </tr>
          ${discount > 0 ? `<tr>
            <td style="color:#dc2626;">Privilege Discount:</td>
            <td class="amount" style="color:#dc2626;">-&#2547;${discount.toLocaleString()}</td>
          </tr>` : ''}
          ${couponDiscount > 0 ? `<tr>
            <td style="color:#dc2626;">Coupon Discount:</td>
            <td class="amount" style="color:#dc2626;">-&#2547;${couponDiscount.toLocaleString()}</td>
          </tr>` : ''}
          <tr>
            <td>Shipping & Packaging:</td>
            <td class="amount">${shippingFee === 0 ? 'FREE' : `&#2547;${shippingFee.toLocaleString()}`}</td>
          </tr>
          <tr class="grand-row">
            <td>Grand Total:</td>
            <td class="amount">&#2547;${grandTotal.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Official Stamp & Authenticity Footer -->
    <div class="invoice-footer">
      <div class="footer-left">
        Computer-generated Atelier Tax Invoice &bull; No physical seal required &bull; Thank you for choosing ${brandName}.
      </div>
      <div class="footer-right">
        Authorized Atelier Copy
      </div>
    </div>
  </div>

  <script>
    if (new URLSearchParams(window.location.search).get('print') === 'true') {
      window.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
          window.print();
        }, 350);
      });
    }
  </script>
</body>
</html>`;

  return {
    order,
    invoiceNumber,
    invoiceDate,
    company,
    html
  };
}

export function exportOrdersCsv(): string {
  const orders = loadDb().orders;
  const header = [
    'order_number',
    'created_at',
    'customer_name',
    'customer_email',
    'customer_phone',
    'division',
    'district',
    'items_count',
    'subtotal',
    'discount',
    'shipping_fee',
    'grand_total',
    'payment_method',
    'payment_status',
    'order_status'
  ];
  const rows = orders.map((o) =>
    [
      o.orderNumber,
      o.createdAt,
      o.customer.fullName,
      o.customer.email,
      o.customer.phone,
      o.customer.division,
      o.customer.district,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal,
      o.discount,
      o.shippingFee,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.status
    ]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export async function recordPayment(input: {
  orderId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  currency?: string;
  status?: string;
  gatewayResponse?: unknown;
}): Promise<PaymentRecord> {
  return mutateDb((db) => {
    const payment: PaymentRecord = {
      id: createId('pay'),
      orderId: input.orderId,
      transactionId: input.transactionId || `TXN-${Date.now().toString(36).toUpperCase()}`,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      currency: input.currency || 'BDT',
      status: input.status || 'paid',
      gatewayResponse: input.gatewayResponse,
      paidAt: now()
    };
    db.payments.unshift(payment);
    const order = db.orders.find((o) => o.id === input.orderId || o.orderNumber === input.orderId);
    if (order && payment.status === 'paid') {
      order.paymentStatus = 'PAID';
      order.paymentId = payment.transactionId;
      order.updatedAt = now();
    }
    return payment;
  });
}

export function getPayment(idOrOrderId: string): PaymentRecord | undefined {
  return loadDb().payments.find((p) => p.id === idOrOrderId || p.orderId === idOrOrderId || p.transactionId === idOrOrderId);
}

export async function updatePaymentStatus(id: string, status: string, gatewayResponse?: unknown): Promise<PaymentRecord> {
  return mutateDb((db) => {
    const payment = db.payments.find((p) => p.id === id || p.transactionId === id);
    if (!payment) httpError('Payment not found.', 404);
    payment.status = status;
    if (gatewayResponse) payment.gatewayResponse = gatewayResponse;
    if (status === 'paid' && !payment.paidAt) payment.paidAt = now();
    const order = db.orders.find((o) => o.id === payment.orderId);
    if (order) {
      if (status === 'paid') order.paymentStatus = 'PAID';
      else if (status === 'refunded') order.paymentStatus = 'REFUNDED';
      else if (status === 'failed') order.paymentStatus = 'FAILED';
      order.updatedAt = now();
    }
    return payment;
  });
}

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return loadDb().shippingMethods.find((s) => s.id === id);
}

export async function deleteShippingMethod(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const idx = db.shippingMethods.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    db.shippingMethods.splice(idx, 1);
    return true;
  });
}

export function getReview(id: string): ProductReview | undefined {
  return loadDb().reviews.find((r) => r.id === id);
}

export function getInquiry(id: string): ProductInquiry | undefined {
  return loadDb().inquiries.find((i) => i.id === id);
}

export async function deleteInquiry(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const idx = db.inquiries.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    db.inquiries.splice(idx, 1);
    return true;
  });
}

export function getBlogPost(idOrSlug: string): BlogPost | undefined {
  const key = idOrSlug.toLowerCase();
  return loadDb().blogPosts.find((p) => !p.deletedAt && (p.id.toLowerCase() === key || p.slug.toLowerCase() === key));
}

export async function publishBlogPost(id: string, userId?: string): Promise<BlogPost> {
  return upsertBlog({ status: 'published', publishedAt: now() }, id, userId);
}

export async function scheduleBlogPost(id: string, publishDate: string, userId?: string): Promise<BlogPost> {
  return upsertBlog({ status: 'draft', publishedAt: publishDate }, id, userId);
}

export function getPage(idOrSlug: string): CmsPage | undefined {
  const key = idOrSlug.toLowerCase();
  return loadDb().pages.find((p) => !p.deletedAt && (p.id.toLowerCase() === key || p.slug.toLowerCase() === key));
}

export async function publishPage(id: string, userId?: string): Promise<CmsPage> {
  return updatePage(id, { status: 'published' }, userId);
}

export function getMedia(id: string): MediaFile | undefined {
  return loadDb().media.find((m) => m.id === id);
}

export async function updateMedia(id: string, updates: Partial<MediaFile>): Promise<MediaFile> {
  return mutateDb((db) => {
    const media = db.media.find((m) => m.id === id);
    if (!media) httpError('Media file not found.', 404);
    Object.assign(media, updates, { id });
    return media;
  });
}

export function listMediaFolders(): string[] {
  const folders = new Set(loadDb().media.map((m) => m.folder || 'general'));
  return Array.from(folders);
}

export function getRole(idOrName: string): RoleRecord | undefined {
  return loadDb().roles.find((r) => r.id === idOrName || r.name === idOrName);
}

export async function createRole(input: { name: string; label: string; permissions: string[] }, actorId?: string): Promise<RoleRecord> {
  return mutateDb((db) => {
    if (db.roles.some((r) => r.name === input.name)) {
      httpError('A role with this name already exists.', 409);
    }
    const role: RoleRecord = {
      id: createId('role'),
      name: input.name as AdminRole,
      label: input.label,
      permissions: input.permissions
    };
    db.roles.push(role);
    logAction(db, actorId, 'admin_created', 'roles', role.id, undefined, role);
    return role;
  });
}

export async function updateRole(id: string, updates: Partial<RoleRecord>, actorId?: string): Promise<RoleRecord> {
  return mutateDb((db) => {
    const role = db.roles.find((r) => r.id === id || r.name === id);
    if (!role) httpError('Role not found.', 404);
    Object.assign(role, updates, { id: role.id });
    logAction(db, actorId, 'admin_updated', 'roles', role.id, undefined, updates);
    return role;
  });
}

export async function deleteRole(id: string, actorId?: string): Promise<boolean> {
  return mutateDb((db) => {
    const idx = db.roles.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    const [deleted] = db.roles.splice(idx, 1);
    logAction(db, actorId, 'admin_deleted', 'roles', deleted.id);
    return true;
  });
}

export function getAllPermissions(): Record<string, string[]> {
  return {
    products: ['view', 'create', 'update', 'delete', 'publish'],
    categories: ['view', 'create', 'update', 'delete'],
    inventory: ['view', 'create', 'update', 'stock_adjustment'],
    orders: ['view', 'create', 'update', 'cancel', 'refund'],
    customers: ['view', 'create', 'update', 'delete'],
    banners: ['view', 'create', 'update', 'delete', 'publish'],
    pages: ['view', 'create', 'update', 'delete', 'publish'],
    settings: ['view', 'update'],
    reports: ['view', 'export']
  };
}

export function getAdmin(id: string): User | undefined {
  const admin = loadDb().users.find((u) => u.id === id && u.role === 'ADMIN');
  return admin ? publicUser(admin) : undefined;
}

export async function sendNotification(input: { channel: NotificationEvent['channel']; event: string; payload: unknown }): Promise<NotificationEvent> {
  return mutateDb((db) => {
    const ntf: NotificationEvent = {
      id: createId('ntf'),
      channel: input.channel,
      event: input.event,
      payload: input.payload,
      createdAt: now(),
      sent: true
    };
    db.notifications.unshift(ntf);
    return ntf;
  });
}

export async function markNotificationSent(id: string): Promise<NotificationEvent> {
  return mutateDb((db) => {
    const ntf = db.notifications.find((n) => n.id === id);
    if (!ntf) httpError('Notification not found.', 404);
    ntf.sent = true;
    return ntf;
  });
}

export async function deleteNotification(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const idx = db.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    db.notifications.splice(idx, 1);
    return true;
  });
}

export async function clearNotifications(): Promise<boolean> {
  return mutateDb((db) => {
    db.notifications = [];
    return true;
  });
}

export async function deleteRedirect(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const idx = db.redirects.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    db.redirects.splice(idx, 1);
    return true;
  });
}

// ----------------- Comprehensive Reports & CSV Exporters -----------------

export function productSalesReport() {
  const db = loadDb();
  const salesMap = new Map<string, {
    productId: string;
    productName: string;
    sku: string;
    categoryName: string;
    unitsSold: number;
    revenue: number;
  }>();

  for (const order of db.orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')) {
    for (const item of order.items) {
      const productRef = item.product || db.products.find(p => p.id === item.productId);
      const cur = salesMap.get(item.productId) || {
        productId: item.productId,
        productName: productRef?.name || item.productId,
        sku: productRef?.sku || item.productId,
        categoryName: productRef?.categoryName || productRef?.categoryId || 'Uncategorized',
        unitsSold: 0,
        revenue: 0
      };
      cur.unitsSold += item.quantity;
      cur.revenue += item.price * item.quantity;
      salesMap.set(item.productId, cur);
    }
  }

  const products = [...salesMap.values()].sort((a, b) => b.revenue - a.revenue);
  const totalUnits = products.reduce((s, p) => s + p.unitsSold, 0);
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);

  return { totalUnits, totalRevenue, products };
}

export function stockMovementReport() {
  const txns = loadDb().inventoryTransactions;
  const byType: Record<string, { count: number; totalQuantity: number }> = {};
  for (const t of txns) {
    if (!byType[t.type]) byType[t.type] = { count: 0, totalQuantity: 0 };
    byType[t.type].count += 1;
    byType[t.type].totalQuantity += t.quantity;
  }
  return {
    totalTransactions: txns.length,
    byType,
    recentMovements: txns.slice(0, 50)
  };
}

export function profitReport() {
  const db = loadDb();
  let grossSales = 0;
  let totalCost = 0;
  let totalDiscounts = 0;

  for (const order of db.orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')) {
    grossSales += order.subtotal;
    totalDiscounts += (order.discount || 0) + (order.couponDiscount || 0);
    for (const item of order.items) {
      const prod = db.products.find((p) => p.id === item.productId);
      const unitCost = prod?.costPrice ?? Math.round(item.price * 0.5);
      totalCost += unitCost * item.quantity;
    }
  }

  const netSales = grossSales - totalDiscounts;
  const grossProfit = netSales - totalCost;
  const marginPercentage = netSales > 0 ? Number(((grossProfit / netSales) * 100).toFixed(2)) : 0;

  return {
    grossSales,
    totalDiscounts,
    netSales,
    totalCost,
    grossProfit,
    marginPercentage
  };
}

export function discountReport() {
  const db = loadDb();
  let totalDiscountGiven = 0;

  for (const order of db.orders) {
    const disc = (order.discount || 0) + (order.couponDiscount || 0);
    totalDiscountGiven += disc;
  }

  return {
    totalDiscountGiven,
    couponsAvailable: db.coupons.length,
    offersAvailable: db.offers.length,
    coupons: db.coupons
  };
}

export function paymentReport() {
  const db = loadDb();
  const byMethod: Record<string, { count: number; totalAmount: number }> = {};
  const byStatus: Record<string, number> = {};

  for (const p of db.payments) {
    if (!byMethod[p.paymentMethod]) byMethod[p.paymentMethod] = { count: 0, totalAmount: 0 };
    byMethod[p.paymentMethod].count += 1;
    byMethod[p.paymentMethod].totalAmount += p.amount;

    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  }

  return {
    totalPaymentsCount: db.payments.length,
    totalAmountCollected: db.payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    byMethod,
    byStatus
  };
}

export function shippingReport() {
  const db = loadDb();
  const byZone: Record<string, { count: number; revenue: number }> = {};
  for (const o of db.orders) {
    const zone = o.customer.division?.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka';
    if (!byZone[zone]) byZone[zone] = { count: 0, revenue: 0 };
    byZone[zone].count += 1;
    byZone[zone].revenue += o.shippingFee;
  }
  return {
    totalShipments: db.orders.length,
    totalShippingRevenue: db.orders.reduce((s, o) => s + o.shippingFee, 0),
    byZone,
    methods: db.shippingMethods
  };
}

export function exportProductSalesCsv(): string {
  const report = productSalesReport();
  const header = ['product_id', 'product_name', 'sku', 'category', 'units_sold', 'revenue'];
  const rows = report.products.map((p) =>
    [p.productId, p.productName, p.sku, p.categoryName, p.unitsSold, p.revenue]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export function exportSalesReportCsv(filter?: SalesReportFilter): string {
  const report = salesReport(filter);
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const fromStr = filter?.from || 'Beginning';
  const toStr = filter?.to || 'Present';
  const channelStr = filter?.paymentMethod && filter.paymentMethod !== 'all' ? filter.paymentMethod.toUpperCase() : 'ALL CHANNELS';
  const statusStr = filter?.status && filter.status !== 'all' ? filter.status.toUpperCase() : 'ALL STATUSES';

  const formatMoney = (n: number) => Number(n || 0).toFixed(2);

  // Executive Metadata Header Block (2-column format)
  const metaLines = [
    `"ZIPPY GENTLEMAN'S ATELIER - OFFICIAL SALES LEDGER & FINANCIAL REPORT"`,
    `"Generated At:","${nowStr} UTC"`,
    `"Reporting Window:","${fromStr} to ${toStr}"`,
    `"Filtered Payment Channel:","${channelStr}"`,
    `"Filtered Order Status:","${statusStr}"`,
    `"Total Orders Fulfilled:","${report.totals.orders}"`,
    `"Total Garment Units Sold:","${report.totals.itemsCount} units"`,
    `"Gross Sales Value (GMV):","${formatMoney(report.totals.grossSales)}"`,
    `"Promotional & Voucher Discounts:","-${formatMoney(report.totals.discount)}"`,
    `"Shipping Fees Collected:","${formatMoney(report.totals.shippingFee)}"`,
    `"Net Sales Revenue (BDT):","${formatMoney(report.totals.revenue)}"`,
    `"Average Order Value (AOV):","${formatMoney(report.totals.averageOrderValue)}"`,
    `""` // Empty separator line
  ];

  const header = [
    'Order #',
    'Date & Time',
    'Customer Name',
    'Customer Phone',
    'Delivery City',
    'Items Qty',
    'Payment Channel',
    'Payment Status',
    'Order Status',
    'Subtotal (BDT)',
    'Discount (BDT)',
    'Shipping (BDT)',
    'Total (BDT)'
  ];

  const rows = report.orders.map((o) =>
    [
      o.orderNumber,
      o.createdAt ? o.createdAt.slice(0, 19).replace('T', ' ') : '',
      o.customerName,
      o.customerPhone || '—',
      o.customerCity || '—',
      o.itemsCount,
      o.paymentMethod,
      o.paymentStatus.toUpperCase(),
      o.status.toUpperCase(),
      formatMoney(o.subtotal),
      formatMoney(o.discount),
      formatMoney(o.shippingFee),
      formatMoney(o.total)
    ].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')
  );

  // Accounting Grand Total Footer Row
  const footerRow = [
    `"TOTAL (${report.totals.orders} Orders)"`,
    `""`,
    `""`,
    `""`,
    `""`,
    `"${report.totals.itemsCount} items"`,
    `""`,
    `""`,
    `""`,
    `"${formatMoney(report.totals.grossSales)}"`,
    `"-${formatMoney(report.totals.discount)}"`,
    `"${formatMoney(report.totals.shippingFee)}"`,
    `"${formatMoney(report.totals.revenue)}"`
  ].join(',');

  // UTF-8 BOM prefix for Microsoft Excel + CSV content
  return '\uFEFF' + [...metaLines, header.join(','), ...rows, footerRow].join('\n');
}

export function exportInventoryReportCsv(): string {
  const items = listInventory();
  const header = [
    'SKU',
    'Product Name',
    'Category',
    'Warehouse',
    'Total Stock',
    'Reserved',
    'Available Stock',
    'Min Alert Threshold',
    'Unit Cost (BDT)',
    'Unit Price (BDT)',
    'Total Valuation (BDT)',
    'Health Status',
    'Last Updated'
  ];
  const rows = items.map((i) =>
    [
      i.sku,
      i.productName,
      i.categoryName,
      i.warehouseName,
      i.quantity,
      i.reservedQuantity,
      i.availableQuantity,
      i.minimumStock,
      i.costPrice,
      i.price,
      i.availableQuantity * (i.price || 0),
      i.status === 'out_of_stock' ? 'Out of Stock' : i.status === 'low_stock' ? 'Low Stock' : 'Optimal',
      i.updatedAt
    ]
      .map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export function exportStockMovementCsv(): string {
  const txns = loadDb().inventoryTransactions;
  const header = ['transaction_id', 'created_at', 'product_id', 'warehouse_id', 'type', 'quantity', 'reference', 'note', 'created_by'];
  const rows = txns.map((t) =>
    [t.id, t.createdAt, t.productId, t.warehouseId, t.type, t.quantity, t.reference || '', t.note || '', t.createdBy]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export function exportCustomersReportCsv(): string {
  const customers = listCustomers();
  const header = ['id', 'full_name', 'email', 'phone', 'status', 'created_at'];
  const rows = customers.map((c) =>
    [c.id, c.fullName, c.email, c.phone, c.status || 'active', c.createdAt || '']
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export function exportOrdersReportCsv(): string {
  return exportOrdersCsv();
}

export function exportProfitCsv(): string {
  const p = profitReport();
  const header = ['metric', 'amount'];
  const rows = [
    ['Gross Sales', p.grossSales],
    ['Total Discounts', p.totalDiscounts],
    ['Net Sales', p.netSales],
    ['Total Cost', p.totalCost],
    ['Gross Profit', p.grossProfit],
    ['Margin Percentage', `${p.marginPercentage}%`]
  ].map((r) => `"${r[0]}","${r[1]}"`);
  return [header.join(','), ...rows].join('\n');
}

export function exportShippingCsv(): string {
  const s = shippingReport();
  const header = ['zone', 'shipments', 'revenue'];
  const rows = Object.entries(s.byZone).map(([zone, data]) =>
    `"${zone}","${data.count}","${data.revenue}"`
  );
  return [header.join(','), ...rows].join('\n');
}

export function exportDiscountCsv(): string {
  const db = loadDb();
  const header = ['Coupon / Offer Code', 'Type', 'Discount Value', 'Max Usage', 'Usage Count', 'Status'];
  const rows = db.coupons.map((c) =>
    [
      c.code,
      c.type || 'fixed',
      c.value || (c as any).discount || 0,
      c.usageLimit || 'Unlimited',
      c.usedCount || 0,
      c.status || 'active'
    ]
      .map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export function exportPaymentCsv(): string {
  const db = loadDb();
  const header = ['Payment ID', 'Order ID', 'Channel', 'Amount (BDT)', 'Currency', 'Transaction ID', 'Status', 'Date'];
  const rows = db.payments.map((p) =>
    [
      p.id,
      p.orderId,
      p.paymentMethod,
      p.amount,
      p.currency || 'BDT',
      p.transactionId || '—',
      p.status,
      p.createdAt || ''
    ]
      .map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export { inventoryOf };
