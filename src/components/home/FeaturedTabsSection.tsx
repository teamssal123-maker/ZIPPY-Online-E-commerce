import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductCard } from '../products/ProductCard';
import { hrefFor } from '../../utils/routes';

export const FeaturedTabsSection: React.FC = () => {
  const { products } = useShop();
  const [activeTab, setActiveTab] = useState<'new' | 'blazer' | 'ethnic' | 'shirt' | 'sale'>('new');

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'new':
        return products.filter((p) => p.newArrival).slice(0, 8);
      case 'blazer':
        return products.filter((p) => p.categoryId === 'blazer').slice(0, 8);
      case 'ethnic':
        return products.filter((p) => p.categoryId === 'ethnic-wear').slice(0, 8);
      case 'shirt':
        return products.filter((p) => p.categoryId === 'shirt').slice(0, 8);
      case 'sale':
        return products.filter((p) => p.onSale).slice(0, 8);
      default:
        return products.slice(0, 8);
    }
  };

  const currentProducts = getFilteredProducts();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B38] font-semibold">
            The Atelier Selection
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
            FEATURED COLLECTIONS
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-none border border-neutral-200">
          {[
            { id: 'new', label: 'New Arrivals' },
            { id: 'blazer', label: 'Blazers & Suits' },
            { id: 'ethnic', label: 'Ethnic Panjabi' },
            { id: 'shirt', label: 'Executive Shirts' },
            { id: 'sale', label: 'Sale Highlights' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View more link */}
      <div className="text-center mt-12">
        <a
          href={hrefFor(
            'shop',
            activeTab === 'blazer'
              ? 'blazer'
              : activeTab === 'ethnic'
                ? 'ethnic-wear'
                : activeTab === 'shirt'
                  ? 'shirt'
                  : activeTab === 'sale'
                    ? 'sale'
                    : 'new-arrivals'
          )}
          className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors cursor-pointer"
        >
          <span>Explore Full Collection</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};
