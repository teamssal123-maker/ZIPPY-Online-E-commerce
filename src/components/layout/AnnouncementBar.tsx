import React, { useState } from 'react';
import { Phone, MapPin, PackageCheck, X } from 'lucide-react';
import { hrefFor } from '../../utils/routes';
import { useShop } from '../../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useShop();
  const [dismissed, setDismissed] = useState(false);

  // If disabled from Admin Header & Footer settings or dismissed by user
  if (dismissed || settings?.headerAnnouncementEnabled === false) return null;

  const resolveHref = (url?: string, defaultView = 'home') => {
    if (!url) return hrefFor(defaultView);
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

  const hotline = settings?.headerHotline || settings?.phone || '+880 9612-742462';
  const announcementText = settings?.headerAnnouncementText || 'Complimentary Dhaka Delivery on Orders Above ৳3,000';
  const locatorText = settings?.headerLocatorText || 'Atelier Locator';
  const locatorUrl = resolveHref(settings?.headerLocatorUrl, 'stores');
  const trackOrderText = settings?.headerTrackOrderText || 'Track Order';
  const trackOrderUrl = resolveHref(settings?.headerTrackOrderUrl, 'track-order');

  return (
    <div className="bg-[#111111] text-neutral-300 text-[11px] tracking-wide border-b border-neutral-800 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        {/* Left: Hotline & Announcement Text */}
        <div className="flex items-center gap-4">
          <a
            href={`tel:${hotline.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 text-[#D4AF37]" />
            <span className="hidden sm:inline">Concierge:</span>
            <span className="tabular-nums font-medium">{hotline}</span>
          </a>
          {announcementText && (
            <>
              <span className="text-neutral-700 hidden md:inline">|</span>
              <span className="hidden md:inline text-neutral-400">
                {announcementText}
              </span>
            </>
          )}
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href={locatorUrl}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <MapPin className="w-3 h-3 text-[#D4AF37]" />
            <span>{locatorText}</span>
          </a>

          <a
            href={trackOrderUrl}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <PackageCheck className="w-3 h-3 text-[#D4AF37]" />
            <span>{trackOrderText}</span>
          </a>

          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="text-neutral-500 hover:text-white ml-1 p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
