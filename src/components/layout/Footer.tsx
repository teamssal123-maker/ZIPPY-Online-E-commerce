import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Truck,
  Check,
  Star,
  Award,
  Clock,
  Heart
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { hrefFor, applyHash } from '../../utils/routes';
import type { FooterPillarItem, FooterLinkItem } from '../../types';

export const Footer: React.FC = () => {
  const {
    showToast,
    setIsSizeGuideOpen,
    settings,
    setActiveView,
    setSelectedCategorySlug,
    setSelectedProductSlug,
    setSearchQuery
  } = useShop();

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

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Privilege newsletter invitation registered.');
    setNewsletterEmail('');
  };

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
      description: `Expert stylists available 7 days a week: ${settings?.phone || '+880 9612-742462'}.`
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
    { id: 'col2-6', label: 'Return & Exchange Policy', url: '/returns' },
    { id: 'col2-7', label: 'Concierge & Inquiries', url: '/contact' }
  ];

  const pillars = settings?.footerPillars && settings.footerPillars.length > 0
    ? settings.footerPillars
    : defaultPillars;

  const showPillars = settings?.footerPillarsEnabled !== false;

  const col1Title = settings?.footerCol1Title || 'Collections';
  const col1Links = settings?.footerCol1Links && settings.footerCol1Links.length > 0
    ? settings.footerCol1Links
    : defaultCol1Links;

  const col2Title = settings?.footerCol2Title || 'Client Services';
  const col2Links = settings?.footerCol2Links && settings.footerCol2Links.length > 0
    ? settings.footerCol2Links
    : defaultCol2Links;

  const showNewsletter = settings?.footerNewsletterEnabled !== false;
  const newsletterTitle = settings?.footerNewsletterTitle || 'Privilege Circle';
  const newsletterSubtitle = settings?.footerNewsletterSubtitle || 'Receive private invitations to preview seasonal collections and bespoke trunk shows.';

  const brandName = settings?.website_name || settings?.websiteName || 'ZIPPY';
  const tagline = settings?.footerTagline || "The Gentleman's Wardrobe";
  const aboutText = settings?.footerAboutText || `Founded on the belief that sartorial refinement is an attitude, ${brandName} curates bespoke blazers, pure Egyptian cotton shirts, executive polos, and festive ethnic wear for the distinguished gentlemen of Bangladesh.`;

  const rawCopyright = settings?.footerCopyright || '© {year} {brand} Bangladesh. All rights reserved. Refined luxury menswear.';
  const formattedCopyright = rawCopyright
    .replace('{year}', new Date().getFullYear().toString())
    .replace('{brand}', brandName);

  const paymentBadges = settings?.footerPaymentBadges && settings.footerPaymentBadges.length > 0
    ? settings.footerPaymentBadges
    : ['CASH ON DELIVERY', 'bKash', 'SSLCOMMERZ', 'VISA / MASTERCARD'];

  const renderPillarIcon = (iconName: string) => {
    switch ((iconName || '').toLowerCase()) {
      case 'shield':
      case 'shieldcheck':
        return <ShieldCheck className="w-5 h-5 stroke-[1.5]" />;
      case 'refresh':
      case 'refreshcw':
        return <RefreshCw className="w-5 h-5 stroke-[1.5]" />;
      case 'phone':
        return <Phone className="w-5 h-5 stroke-[1.5]" />;
      case 'star':
        return <Star className="w-5 h-5 stroke-[1.5]" />;
      case 'award':
        return <Award className="w-5 h-5 stroke-[1.5]" />;
      case 'clock':
        return <Clock className="w-5 h-5 stroke-[1.5]" />;
      case 'heart':
        return <Heart className="w-5 h-5 stroke-[1.5]" />;
      case 'truck':
      default:
        return <Truck className="w-5 h-5 stroke-[1.5]" />;
    }
  };

  const resolveFooterHref = (url: string) => {
    if (!url) return hrefFor('home');
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('#')
    ) {
      return url;
    }
    return `#${url.startsWith('/') ? url : `/${url}`}`;
  };

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('tel:') ||
      url.startsWith('mailto:')
    ) {
      return;
    }
    e.preventDefault();
    const clean = url.replace(/^#/, '');
    if (clean.startsWith('/shop/')) {
      const cat = clean.replace('/shop/', '');
      setSelectedCategorySlug(cat);
      setActiveView('shop');
      applyHash('shop', cat);
    } else if (clean === '/shop' || clean === 'shop') {
      setSelectedCategorySlug(null);
      setActiveView('shop');
      applyHash('shop');
    } else if (clean === '/' || clean === '/home' || clean === 'home' || clean === '') {
      handleGoHome(e);
      return;
    } else {
      const viewName = clean.replace(/^\//, '');
      setActiveView(viewName);
      applyHash(viewName);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderLinkItem = (link: FooterLinkItem) => {
    if (link.url === '#size-guide') {
      return (
        <button
          key={link.id}
          type="button"
          onClick={() => setIsSizeGuideOpen(true)}
          className={`hover:text-white transition-colors text-left cursor-pointer ${link.highlight ? 'text-red-400 font-medium' : ''}`}
        >
          {link.label}
        </button>
      );
    }

    const href = resolveFooterHref(link.url);

    return (
      <a
        key={link.id}
        href={href}
        onClick={(e) => handleFooterLinkClick(e, link.url)}
        target={link.openInNewTab ? '_blank' : undefined}
        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        className={`hover:text-white transition-colors block cursor-pointer ${link.highlight ? 'text-red-400 hover:text-red-300 font-medium' : ''}`}
      >
        {link.label}
      </a>
    );
  };

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-12 border-t border-neutral-800">
      {/* 4 Pillars of Excellence */}
      {showPillars && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-neutral-800">
          <div className={`grid grid-cols-1 ${pillars.length === 3 ? 'md:grid-cols-3' : pillars.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-8 text-center md:text-left`}>
            {pillars.map((pillar) => (
              <div key={pillar.id} className="flex flex-col items-center md:items-start">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#D4AF37] mb-3">
                  {renderPillarIcon(pillar.icon)}
                </div>
                <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-200">
                  {pillar.title}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className={`grid grid-cols-1 md:grid-cols-2 ${showNewsletter ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-10`}>
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <a
              href={hrefFor('home')}
              onClick={handleGoHome}
              className="inline-block cursor-pointer focus:outline-none group"
              aria-label="Home"
            >
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-white uppercase group-hover:text-[#D4AF37] transition-colors">
                {brandName}
              </span>
            </a>
            {tagline && (
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] mt-0.5">
                {tagline}
              </p>
            )}
            {aboutText && (
              <p className="text-xs text-neutral-400 mt-4 leading-relaxed max-w-sm">
                {aboutText}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                <span>{settings?.address || 'Gulshan 1, Dhaka'}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>{settings?.phone || '+880 9612-742462'}</span>
              </div>
            </div>
          </div>

          {/* Quick Col 1 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-4">
              {col1Title}
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {col1Links.map((link) => (
                <li key={link.id}>
                  {renderLinkItem(link)}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Col 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-4">
              {col2Title}
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {col2Links.map((link) => (
                <li key={link.id}>
                  {renderLinkItem(link)}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-4">
                {newsletterTitle}
              </h4>
              <p className="text-xs text-neutral-400 mb-4">
                {newsletterSubtitle}
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 p-3 bg-neutral-900 border border-neutral-800 text-xs text-green-400">
                  <Check className="w-4 h-4" />
                  <span>You are subscribed to the Circle.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="relative">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1 bottom-1 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                      aria-label="Subscribe"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500 block">
                    By joining, you accept our privacy policy.
                  </span>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Payment Logos & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <p className="text-[11px]">
          {formattedCopyright}
        </p>

        {/* Payment Methods Badges */}
        {paymentBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400">
            {paymentBadges.map((badge, idx) => {
              const isBkash = badge.toLowerCase().includes('bkash');
              return (
                <span
                  key={idx}
                  className={`px-2 py-1 border ${
                    isBkash
                      ? 'bg-[#E2136E]/20 text-[#FF4081] border-[#E2136E]/40 font-bold'
                      : 'bg-neutral-900 border-neutral-800 font-semibold tracking-wider text-neutral-300'
                  }`}
                >
                  {badge}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </footer>
  );
};
