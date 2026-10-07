const VIEW_PATHS: Record<string, string> = {
  home: '/',
  shop: '/shop',
  cart: '/cart',
  checkout: '/checkout',
  'order-success': '/order-success',
  'track-order': '/track-order',
  account: '/account',
  wishlist: '/wishlist',
  stores: '/stores',
  about: '/about',
  faq: '/faq',
  returns: '/returns',
  contact: '/contact',
  privacy: '/privacy-policy',
  terms: '/terms',
  admin: '/admin'
};

export interface AppRoute {
  view: string;
  category: string | null;
  product: string | null;
}

export function pathFor(view: string, category?: string | null, product?: string | null): string {
  if (view === 'shop') {
    return category && category !== 'all' ? `/shop/${category}` : '/shop';
  }
  if (view === 'product-detail') {
    return product ? `/product/${product}` : '/shop';
  }
  return VIEW_PATHS[view] || '/';
}

export function hrefFor(view: string, category?: string | null, product?: string | null): string {
  return `#${pathFor(view, category, product)}`;
}

export function parseLocation(): AppRoute {
  const raw = window.location.hash?.replace(/^#/, '') || window.location.pathname || '/';
  const path = raw.split('?')[0] || '/';
  const parts = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts.length === 0 || parts[0] === 'home') return { view: 'home', category: null, product: null };
  if (parts[0] === 'shop') return { view: 'shop', category: parts[1] || 'all', product: null };
  if (parts[0] === 'product' && parts[1]) {
    return { view: 'product-detail', category: null, product: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'privacy-policy' || parts[0] === 'privacy') return { view: 'privacy', category: null, product: null };
  if (parts[0] === 'terms' || parts[0] === 'terms-conditions') return { view: 'terms', category: null, product: null };
  if (parts[0] === 'contact' || parts[0] === 'contact-us') return { view: 'contact', category: null, product: null };
  if (parts[0] === 'atelier') return { view: 'about', category: null, product: null };
  if (parts[0] === 'admin') return { view: 'admin', category: null, product: null };
  const view = Object.entries(VIEW_PATHS).find(([, value]) => value === `/${parts[0]}`)?.[0];
  return { view: view || 'home', category: null, product: null };
}

export function applyHash(view: string, category?: string | null, product?: string | null) {
  const next = hrefFor(view, category, product);
  if (typeof window !== 'undefined') {
    if (view === 'home' && window.location.pathname !== '/' && window.location.pathname !== '') {
      try {
        window.history.pushState(null, '', `/${next}`);
      } catch {
        // ignore
      }
    }
    if (window.location.hash !== next) {
      window.location.hash = next;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

