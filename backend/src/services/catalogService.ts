import { loadDb, mutateDb } from '../store/db.ts';
import type { Category, Product, ProductReview } from '../types/index.ts';
import { slugify, createId } from '../utils/ids.ts';

export interface ProductQuery {
  q?: string;
  category?: string;
  categoryId?: string;
  subcategoryId?: string;
  brand?: string;
  brandId?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
  onSale?: boolean;
  isActive?: boolean;
  status?: string;
  sku?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'bestseller';
}

function matchesQuery(product: Product, query: ProductQuery): boolean {
  const cat = query.categoryId || query.category;
  if (cat && cat !== 'all') {
    const slug = cat.toLowerCase();
    if (product.categoryId?.toLowerCase() !== slug && product.slug?.toLowerCase() !== slug && product.categoryName?.toLowerCase() !== slug) {
      return false;
    }
  }
  if (query.subcategoryId && product.subcategoryId !== query.subcategoryId) return false;
  if (query.brandId && product.brandId !== query.brandId) return false;
  if (query.brand && product.brandId !== query.brand) return false;
  if (query.featured != null && product.featured !== query.featured) return false;
  if (query.newArrival != null && product.newArrival !== query.newArrival) return false;
  if (query.bestSeller != null && product.bestSeller !== query.bestSeller) return false;
  if (query.trending != null && product.trending !== query.trending) return false;
  if (query.onSale != null && product.onSale !== query.onSale) return false;
  if (query.isActive != null && product.isActive !== query.isActive) return false;
  if (query.status && product.status !== query.status) return false;
  if (query.sku && product.sku?.toLowerCase() !== query.sku.toLowerCase()) return false;
  if (query.minPrice != null && (product.salePrice ?? product.price) < query.minPrice) return false;
  if (query.maxPrice != null && (product.salePrice ?? product.price) > query.maxPrice) return false;
  if (query.q) {
    const hay = `${product.name} ${product.sku} ${(product.tags || []).join(' ')} ${product.fabric || ''} ${product.description || ''} ${product.metaKeywords || ''}`.toLowerCase();
    if (!hay.includes(query.q.toLowerCase())) return false;
  }
  return true;
}

function sortProducts(products: Product[], sort?: ProductQuery['sort']): Product[] {
  const copy = [...products];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case 'price_desc':
      return copy.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'bestseller':
      return copy.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    default:
      return copy;
  }
}

export function listCategories(): Category[] {
  const db = loadDb();
  const allCategories = db.categories.filter((category) => !category.deletedAt);
  const allProducts = db.products.filter((p) => !p.deletedAt);

  return allCategories
    .map((category) => {
      const categoryProducts = allProducts.filter(
        (p) =>
          p.categoryId === category.id ||
          p.categoryId === category.slug ||
          p.subcategoryId === category.id ||
          p.subcategoryId === category.slug
      );
      const parent = category.parentId ? allCategories.find((c) => c.id === category.parentId || c.slug === category.parentId) : undefined;
      const subcategoriesCount = allCategories.filter((c) => c.parentId === category.id || c.parentId === category.slug).length;
      const totalStockUnits = categoryProducts.reduce(
        (sum, p) => sum + (p.stockQuantity ?? Object.values(p.stock || {}).reduce((a, b) => a + b, 0)),
        0
      );

      return {
        ...category,
        itemCount: categoryProducts.length,
        totalStockUnits,
        subcategoriesCount,
        parentName: parent?.name
      };
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function listProducts(query: ProductQuery = {}): Product[] {
  const filtered = loadDb().products.filter((product) => !product.deletedAt && matchesQuery(product, query));
  return sortProducts(filtered, query.sort);
}

export function getProduct(idOrSlug: string): Product | undefined {
  const key = idOrSlug.toLowerCase();
  return loadDb().products.find(
    (p) =>
      !p.deletedAt &&
      (p.id.toLowerCase() === key || p.slug.toLowerCase() === key || p.sku.toLowerCase() === key)
  );
}

export async function createProduct(input: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  return mutateDb((db) => {
    const ts = new Date().toISOString();
    let finalSlug = slugify(input.slug || input.name || 'product');
    if (db.products.some((p) => p.slug === finalSlug && !p.deletedAt)) {
      finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
    }
    const product: Product = {
      ...input,
      id: input.id || createId('prod'),
      slug: finalSlug,
      onSale: Boolean(input.salePrice && input.salePrice < input.price),
      status: input.status || 'published',
      isActive: input.isActive ?? true,
      createdAt: input.createdAt || ts,
      updatedAt: ts
    };
    db.products.unshift(product);
    return product;
  });
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
  return mutateDb((db) => {
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    const existing = db.products[index];
    const next = { ...existing, ...updates, id, updatedAt: new Date().toISOString() };
    if (next.salePrice && next.salePrice < next.price) {
      next.onSale = true;
    } else {
      next.onSale = false;
      if (updates.salePrice === null) next.salePrice = undefined;
    }
    if (updates.slug !== undefined) {
      const clean = slugify(updates.slug || updates.name || existing.name);
      next.slug = clean || existing.slug;
    } else if (updates.name && !next.slug) {
      next.slug = slugify(updates.name);
    }
    if (updates.categoryId) {
      const cat = db.categories.find((c) => c.id === updates.categoryId);
      if (cat) next.categoryName = cat.name;
    }
    if (updates.status) {
      next.isActive = updates.status === 'published' || updates.status === 'active';
    }
    db.products[index] = next;
    return next;
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const product = db.products.find((p) => p.id === id);
    if (!product || product.deletedAt) return false;
    product.deletedAt = new Date().toISOString();
    product.isActive = false;
    product.status = 'archived';
    return true;
  });
}

export function listStores() {
  return loadDb().stores;
}

export function listReviews(productId?: string) {
  const reviews = loadDb().reviews;
  return productId ? reviews.filter((r) => r.productId === productId) : reviews;
}

export async function addReview(review: ProductReview): Promise<ProductReview> {
  return mutateDb((db) => {
    db.reviews.unshift(review);
    const product = db.products.find((p) => p.id === review.productId);
    if (product) {
      const related = db.reviews.filter((r) => r.productId === product.id);
      const avg = related.reduce((sum, r) => sum + r.rating, 0) / related.length;
      product.rating = Number(avg.toFixed(1));
      product.reviewCount = related.length;
    }
    return review;
  });
}
