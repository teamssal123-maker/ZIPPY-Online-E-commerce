import React, { useState, useEffect } from 'react';
import {
  Search,
  User as UserIcon,
  Heart,
  ShoppingBag,
  Menu,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { SearchModal } from '../common/SearchModal';
import { hrefFor, applyHash } from '../../utils/routes';
import type { HeaderNavItem } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activeView,
    setActiveView,
    selectedCategorySlug,
    setSelectedCategorySlug,
    setSelectedProductSlug,
    setSearchQuery,
    cartItemCount,
    setIsCartOpen,
    wishlist,
    user,
    logout,
    login,
    settings,
    setIsStylistOpen
  } = useShop();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [settings?.logo]);

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

  const isSticky = settings?.headerSticky !== false;
  const showSearch = settings?.headerShowSearch !== false;
  const showAccount = settings?.headerShowAccount !== false;
  const showWishlist = settings?.headerShowWishlist !== false;
  const showCart = settings?.headerShowCart !== false;

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

  const isLinkActive = (link: HeaderNavItem) => {
    if (isHomeLink(link)) {
      return activeView === 'home';
    }
    if (link.slug) {
      return activeView === 'shop' && selectedCategorySlug === link.slug;
    }
    if (link.url && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      return currentPath === link.url || currentHash === link.url || currentHash === `#${link.url}`;
    }
    return false;
  };

  return (
    <>
      <header className={`${isSticky ? 'sticky top-0' : 'relative'} z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Zone 1: Brand Wordmark / Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenMobileMenu}
                className="lg:hidden p-2 -ml-2 text-neutral-800 hover:text-black transition-colors"
                aria-label="Open mobile navigation"
              >
                <Menu className="w-6 h-6 stroke-[1.5]" />
              </button>

              <a
                href={hrefFor('home')}
                onClick={handleGoHome}
                className="group flex items-center gap-3 text-left cursor-pointer focus:outline-none"
                aria-label="Home"
              >
                {settings?.logo && !logoError ? (
                  <img
                    src={settings.logo}
                    alt={settings?.website_name || settings?.websiteName || 'Zippy'}
                    className="h-9 sm:h-11 w-auto max-w-[200px] object-contain transition-opacity group-hover:opacity-90"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.18em] text-neutral-900 group-hover:text-black transition-colors uppercase">
                    {settings?.website_name || settings?.websiteName || 'ZIPPY'}
                  </span>
                )}
              </a>
            </div>

            {/* Zone 2: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold tracking-widest text-neutral-700">
              {navLinks.map((link) => {
                const isHome = isHomeLink(link);
                const isActive = isLinkActive(link);
                const href = resolveNavHref(link);

                return (
                  <a
                    key={link.id || link.slug || link.label}
                    href={href}
                    onClick={isHome ? handleGoHome : undefined}
                    target={link.openInNewTab ? '_blank' : undefined}
                    rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                    className={`relative py-2 whitespace-nowrap transition-colors uppercase inline-flex items-center gap-1.5 cursor-pointer ${
                      link.highlight ? 'text-[#B00020] hover:text-[#880015]' : 'hover:text-black'
                    } ${isActive ? 'text-black font-bold' : ''}`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-normal bg-red-100 text-red-700 leading-none">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900 animate-in fade-in duration-200" />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Trigger */}
              {showSearch && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100/60 rounded-full transition-colors"
                  aria-label="Search garments"
                  title="Search products"
                >
                  <Search className="w-5 h-5 stroke-[1.5]" />
                </button>
              )}

              {/* Live Chat Concierge Trigger */}
              <button
                onClick={() => setIsStylistOpen(true)}
                className="p-2 text-neutral-700 hover:text-black hover:bg-neutral-100/60 rounded-full transition-colors relative cursor-pointer"
                aria-label="Open Live Chat Concierge"
                title="Chat with Zippy Concierge"
              >
                <MessageSquare className="w-5 h-5 stroke-[1.5]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              </button>


              {/* Account Dropdown */}
              {showAccount && (
                <div className="relative">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-1 p-2 text-neutral-700 hover:text-black hover:bg-neutral-100/60 rounded-full transition-colors cursor-pointer"
                    aria-label="Account menu"
                  >
                    <UserIcon className="w-5 h-5 stroke-[1.5]" />
                    <ChevronDown className="w-3 h-3 hidden sm:inline text-neutral-400" />
                  </button>

                  {isAccountMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setIsAccountMenuOpen(false)}
                    >
                      {user ? (
                        <>
                          <div className="px-4 py-2 border-b border-neutral-100">
                            <p className="text-xs font-semibold text-neutral-900 truncate">
                              {user.fullName}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                          </div>

                          <a
                            href={hrefFor('account')}
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black flex items-center gap-2"
                          >
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>My Account</span>
                          </a>

                          <a
                            href={hrefFor('account')}
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black flex items-center gap-2"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Orders & Invoices</span>
                          </a>

                          <a
                            href={hrefFor('stores')}
                            onClick={() => setIsAccountMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 hover:text-black flex items-center gap-2"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Store Locator</span>
                          </a>

                          <div className="border-t border-neutral-100 my-1" />

                          <button
                            onClick={() => {
                              logout();
                              setIsAccountMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-3">
                          <p className="text-xs text-neutral-600 mb-3">
                            Access your orders, bespoke tailoring bookings, and wishlist.
                          </p>
                          <button
                            onClick={() => {
                              login('vip@zippy.com.bd');
                              setIsAccountMenuOpen(false);
                            }}
                            className="w-full py-2 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
                          >
                            Sign In / Demo VIP
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist */}
              {showWishlist && (
                <a
                  href={hrefFor('wishlist')}
                  className="relative p-2 text-neutral-700 hover:text-black hover:bg-neutral-100/60 rounded-full transition-colors"
                  aria-label="View wishlist"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 stroke-[1.5]" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center rounded-full tabular-nums">
                      {wishlist.length}
                    </span>
                  )}
                </a>
              )}

              {/* Shopping Bag Drawer Trigger */}
              {showCart && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-2 p-2 text-neutral-900 hover:bg-neutral-100/60 rounded-full transition-colors"
                  aria-label="Open cart"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#B00020] text-white text-[9px] font-bold flex items-center justify-center rounded-full tabular-nums">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Live Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
