import React from 'react';
import { Award, Compass, Sparkles, Scissors, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { hrefFor } from '../../utils/routes';

export const BrandStorySection: React.FC = () => {
  const pillars = [
    {
      icon: Scissors,
      title: 'Bespoke Pattern Crafting',
      description:
        'Every blazer pattern is drafted with calibrated shoulder roll and contoured waist suppression for an athletic, dignified silhouette.'
    },
    {
      icon: Award,
      title: 'Provenance of Materials',
      description:
        'We source exclusively from historic mills in Biella (Italy), Normandy flax farms, and Alexandria Egyptian cotton ginners.'
    },
    {
      icon: Sparkles,
      title: 'Artisanal Embroidery',
      description:
        'Our festive panjabis are adorned with hand-guided antique zari and platinum filament threads by master Bengali craftsmen.'
    },
    {
      icon: Compass,
      title: 'Atelier Fit Assurance',
      description:
        'In-store complimentary alterations ensure every sleeve, collar, and hem drape with zero compromise.'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-neutral-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Visual Asset with Editorial Badge */}
        <div className="lg:col-span-5 relative">
          <div className="aspect-[4/5] overflow-hidden bg-neutral-100 border border-neutral-200 shadow-md">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=1000&auto=format&fit=crop"
              alt="Zippy Bespoke Tailoring Studio"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -right-6 bg-white border border-neutral-200 p-5 shadow-xl hidden sm:block max-w-[220px]">
            <span className="text-[10px] uppercase tracking-widest text-[#9A7B38] font-bold block">
              EST. BANGLADESH
            </span>
            <p className="font-serif text-sm font-bold text-neutral-900 mt-1">
              "Elegance is not being noticed, it's about being remembered."
            </p>
          </div>
        </div>

        {/* Right Column: Narrative & Pillars */}
        <div className="lg:col-span-7">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B38] font-semibold">
            Our Heritage & Philosophy
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900 mt-1 text-balance">
            CRAFTED FOR THE MODERN GENTLEMAN
          </h2>

          <p className="mt-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Zippy was established to elevate menswear in Bangladesh into an art of quiet dignity.
            Rejecting disposable fast fashion, we champion sartorial discipline: garments designed
            to flatter the male form, endure across seasons, and instil effortless poise in every
            boardroom, wedding stage, and private evening.
          </p>

          {/* Pillars 2x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                      {pillar.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Atelier Visit Link */}
          <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <MapPin className="w-4 h-4 text-[#9A7B38]" />
              <span>Experience private tailoring at our Gulshan & Banani flagships.</span>
            </div>

            <a
              href={hrefFor('stores')}
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-[#9A7B38] underline transition-colors cursor-pointer"
            >
              Locate Nearest Atelier
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
