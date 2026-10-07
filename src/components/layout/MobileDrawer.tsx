import React from 'react';
import { X, ChevronRight, Phone, MapPin, PackageCheck, Heart, User } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { hrefFor, applyHash } from '../../utils/routes';
import type { HeaderNavItem } from '../../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const {
    activeView,
    setActiveView,
    selectedCategorySlug,
    setSelectedCategorySlug,
    setSelectedProductSlug,
    setSearchQuery,
    user,
    wishlist,
    settings,
    setIsStylistOpen
  } = useShop();

  const [logoError, setLogoError] = React.useState(false);

  React.useEffect(() => {
    setLogoError(false);
  }, [settings?.logo]);

  if (!isOpen) return null;

  const defaultNavLinks: HeaderNavItem[] = [
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

  const navLinks = settings?.headerNavItems && settings.headerNavItems.length > 0
    ? settings.headerNavItems
    : defaultNavLinks;

  const isHomeLink = (link?: { url?: string; slug?: string; isHome?: boolean; label?: string } | null): boolean => {
    if (!link) return false;
    if (link.isHome) return true;
    const label = (link.label || '').trim().toLowerCase();
    if (label === 'home' || label === 'হোম') return true;
    const slug = (link.slug || '').trim().toLowerCase();
    if (slug === 'home' || slug === '/') return true;
    const url = (link.url || '').trim().toLowerCase();
    if (
      url === '/' ||
      url === '#/' ||
      url === '#' ||
      url === '/home' ||
      url === '#/home' ||
      url === '#home' ||
      url === '/index.html' ||
      url === ''
    ) {
      return true;
    }
    return false;
  };

  const resolveNavHref = (link: HeaderNavItem) => {
    if (isHomeLink(link)) return hrefFor('home');
    if (link.slug) return hrefFor('shop', link.slug);
    if (link.url) {
      if (
        link.url.startsWith('http://') ||
        link.url.startsWith('https://') ||
        link.url.startsWith('tel:') ||
        link.url.startsWith('mailto:')
      ) {
        return link.url;
      }
      if (link.url.startsWith('#')) return link.url;
      return `#${link.url.startsWith('/') ? link.url : `/${link.url}`}`;
    }
    return hrefFor('home');
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    onClose();
    setSelectedCategorySlug(null);
    setSelectedProductSlug(null);
    setSearchQuery('');
    setActiveView('home');
    applyHash('home');
    if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '') {
      try {
        window.history.pushState(null, '', '/#/');
      } catch {
        // ignore
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hotline = settings?.headerHotline || settings?.phone || '+880 9612-742462';
  const brandName = settings?.website_name || settings?.websiteName || 'ZIPPY';

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <a
            href={hrefFor('home')}
            onClick={handleGoHome}
            className="focus:outline-none cursor-pointer"
            aria-label="Home"
          >
            {settings?.logo && !logoError ? (
              <img
                src={settings.logo}
                alt={brandName}
                className="h-8 max-w-[150px] object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div>
                <span className="font-serif text-xl font-bold tracking-widest text-neutral-900 uppercase">
                  {brandName}
                </span>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400">
                  Gentleman's Atelier
                </p>
              </div>
            )}
          </a>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
            Navigation Menu
          </div>

          {navLinks.map((link) => {
            const isHome = isHomeLink(link);
            const href = resolveNavHref(link);
            return (
              <a
                key={link.id || link.slug || link.label}
                href={href}
                onClick={isHome ? handleGoHome : onClose}
                target={link.openInNewTab ? '_blank' : undefined}
                rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                className={`w-full flex items-center justify-between py-2.5 text-sm font-semibold transition-colors text-left cursor-pointer ${
                  link.highlight ? 'text-[#B00020] hover:text-[#880015]' : 'text-neutral-800 hover:text-black'
                }`}
              >
                <span>{link.label}</span>
                {link.badge ? (
                  <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 font-bold rounded">
                    {link.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </a>
            );
          })}

          <div className="border-t border-neutral-100 my-4 pt-4 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Services & Account
            </div>

            <a
              href={hrefFor('account')}
              onClick={onClose}
              className="w-full flex items-center gap-3 py-2 text-sm text-neutral-700 hover:text-black"
            >
              <User className="w-4 h-4 text-neutral-500" />
              <span>{user ? user.fullName : 'Sign In / Register'}</span>
            </a>

            <a
              href={hrefFor('wishlist')}
              onClick={onClose}
              className="w-full flex items-center justify-between py-2 text-sm text-neutral-700 hover:text-black"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-neutral-500" />
                <span>My Wishlist</span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-neutral-500">
                {wishlist.length}
              </span>
            </a>

            <a
              href={hrefFor('track-order')}
              onClick={onClose}
              className="w-full flex items-center gap-3 py-2 text-sm text-neutral-700 hover:text-black"
            >
              <PackageCheck className="w-4 h-4 text-neutral-500" />
              <span>Track Your Order</span>
            </a>

            <a
              href={hrefFor('stores')}
              onClick={onClose}
              className="w-full flex items-center gap-3 py-2 text-sm text-neutral-700 hover:text-black"
            >
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span>Boutique Locator</span>
            </a>

            <a
              href={hrefFor('contact')}
              onClick={onClose}
              className="w-full flex items-center gap-3 py-2 text-sm text-neutral-700 hover:text-black"
            >
              <Phone className="w-4 h-4 text-neutral-500" />
              <span>Concierge & Inquiries</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                setIsStylistOpen(true);
              }}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-neutral-900 text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded mt-2 cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white">Atelier Live Chat & Stylist</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                ONLINE
              </span>
            </button>
          </div>
        </div>

        {/* Footer Contact */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-200">
          <a
            href={`tel:${hotline.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-900"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Hotline: {hotline}</span>
          </a>
          <p className="text-[10px] text-neutral-500 mt-1">
            Dhaka Atelier · 10 AM - 10 PM
          </p>
        </div>
      </div>
    </div>
  );
};
