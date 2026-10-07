import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { hrefFor } from '../../utils/routes';

export const CategoryShowcase: React.FC = () => {
  const { categories } = useShop();

  // Primary 4 categories to lead the showcase
  const showcaseCategories = categories.filter(
    (c) => c.slug !== 'sale'
  ).slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-neutral-200">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B38] font-semibold">
            Curated Menswear
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
            SHOP BY CATEGORY
          </h2>
        </div>
        <a
          href={hrefFor('shop', 'all')}
          className="mt-3 sm:mt-0 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-black hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All Departments</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {showcaseCategories.map((cat) => (
          <a
            key={cat.id}
            href={hrefFor('shop', cat.slug)}
            className="group relative cursor-pointer overflow-hidden bg-neutral-100 flex flex-col border border-neutral-200"
          >
            {/* Image Container with 4:5 aspect ratio */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-200">
              <ImageWithFallback
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Text overlay at bottom */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-white flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block">
                    {cat.itemCount} Garments
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mt-0.5 group-hover:text-[#F3E5AB] transition-colors">
                    {cat.name}
                  </h3>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
