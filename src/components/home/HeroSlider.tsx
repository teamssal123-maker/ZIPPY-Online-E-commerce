import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { hrefFor } from '../../utils/routes';
import { api } from '../../api/client';

interface Slide {
  id: string;
  tagline: string;
  title: string;
  subtitle: string;
  image: string;
  categorySlug: string;
  ctaText: string;
  ctaUrl?: string;
  secondaryCtaText: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    tagline: 'Spring / Summer 2026 Sartorial Campaign',
    title: 'THE ART OF TAILORING',
    subtitle: 'Hand-tailored from Super 130s Italian virgin wool with soft shoulder construction and natural drape.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop',
    categorySlug: 'blazer',
    ctaText: 'Shop Blazers',
    ctaUrl: '/shop?category=blazer',
    secondaryCtaText: 'Explore Collection'
  },
  {
    id: 'slide-2',
    tagline: 'Royal Eid & Wedding Edition',
    title: 'ROYAL HERITAGE',
    subtitle: 'Pure silk jacquards and antique zari embroidery crafted for life’s most dignified celebrations.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1800&auto=format&fit=crop',
    categorySlug: 'ethnic-wear',
    ctaText: 'Discover Panjabis',
    ctaUrl: '/shop?category=ethnic-wear',
    secondaryCtaText: 'View Lookbook'
  },
  {
    id: 'slide-3',
    tagline: 'The Executive Standard',
    title: 'EGYPTIAN GIZA 100s',
    subtitle: 'Impeccable single-needle formal shirts spun from long-staple cotton with genuine mother-of-pearl buttons.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1800&auto=format&fit=crop',
    categorySlug: 'shirt',
    ctaText: 'Shop Executive Shirts',
    ctaUrl: '/shop?category=shirt',
    secondaryCtaText: 'Discover All'
  }
];

export const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let mounted = true;
    api.banners(true)
      .then((data) => {
        if (!mounted || !Array.isArray(data) || data.length === 0) return;
        const heroBanners = data.filter((b) => b.position === 'hero' || !b.position);
        const selected = heroBanners.length > 0 ? heroBanners : data;
        if (selected.length > 0) {
          const dynamicSlides: Slide[] = selected.map((b) => ({
            id: b.id,
            tagline: b.position === 'hero' ? 'Sartorial Signature' : b.position.replace(/_/g, ' ').toUpperCase(),
            title: b.title,
            subtitle: b.subtitle || '',
            image: b.imageDesktop,
            categorySlug: b.buttonUrl?.replace(/^\/shop\/?\??category=/, '') || 'blazer',
            ctaText: b.buttonText || 'Shop Collection',
            ctaUrl: b.buttonUrl || '/shop',
            secondaryCtaText: 'Explore Collection'
          }));
          setSlides(dynamicSlides);
        }
      })
      .catch(() => {
        // Fall back gracefully to DEFAULT_SLIDES
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full h-[540px] sm:h-[620px] lg:h-[700px] overflow-hidden bg-neutral-900">
      {/* Background Slides */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <ImageWithFallback
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover brightness-[0.78]"
          />
          {/* Subtle measured scrim for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
            <span>{slide.tagline}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
            {slide.title}
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={slide.ctaUrl || hrefFor('shop', slide.categorySlug)}
              className="px-8 py-3.5 bg-white text-neutral-950 text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-neutral-950 transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={hrefFor('shop')}
              className="px-8 py-3.5 border border-white/70 text-white text-xs font-semibold uppercase tracking-widest hover:bg-white/10 hover:border-white transition-colors cursor-pointer"
            >
              {slide.secondaryCtaText}
            </a>
          </div>
        </div>
      </div>

      {/* Manual Slider Navigation Controls */}
      <div className="absolute z-20 bottom-8 right-6 sm:right-12 flex items-center gap-3">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="p-3 bg-black/40 hover:bg-black/80 text-white border border-white/20 backdrop-blur-xs transition-colors"
          aria-label="Previous campaign slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Slide Numbers */}
        <div className="px-3 py-1 bg-black/40 border border-white/20 text-xs text-white/80 font-mono tabular-nums">
          0{currentSlide + 1} / 0{slides.length}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="p-3 bg-black/40 hover:bg-black/80 text-white border border-white/20 backdrop-blur-xs transition-colors"
          aria-label="Next campaign slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
