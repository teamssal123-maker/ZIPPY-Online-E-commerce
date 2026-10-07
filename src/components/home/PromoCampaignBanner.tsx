import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { hrefFor } from '../../utils/routes';

export const PromoCampaignBanner: React.FC = () => {
  return (
    <section className="bg-[#111111] text-white my-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center">
        {/* Left Editorial Copy */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Limited Trunk Collection</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] text-balance">
            THE SARTORIAL STANDARD
          </h2>

          <p className="mt-4 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md">
            Engineered with uncompromising precision. From hand-stitched Italian lapels to
            liquid-ammonia non-iron treatment on our Egyptian Giza shirts, every garment reflects
            the quiet dignity of genuine craftsmanship.
          </p>

          <div className="mt-6 space-y-2 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Complimentary private fitting session at Gulshan Flagship</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Custom monogramming available on all executive cotton shirts</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <a
              href={hrefFor('shop', 'blazer')}
              className="px-8 py-3.5 bg-[#D4AF37] text-neutral-950 text-xs font-bold uppercase tracking-widest hover:bg-[#c29d28] transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Explore The Edit</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={hrefFor('shop', 'sale')}
              className="px-6 py-3.5 border border-neutral-600 text-neutral-200 text-xs font-semibold uppercase tracking-widest hover:border-white hover:text-white transition-colors cursor-pointer"
            >
              Sale Privileges
            </a>
          </div>
        </div>

        {/* Right High-Fashion Imagery */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[380px] bg-neutral-800 overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop"
            alt="Zippy Bespoke Atelier Collection"
            className="w-full h-full object-cover brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
};
