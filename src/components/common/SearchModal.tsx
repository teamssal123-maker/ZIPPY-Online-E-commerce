import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ImageWithFallback } from './ImageWithFallback';
import { hrefFor } from '../../utils/routes';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products } = useShop();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.categoryName.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            p.fabric.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  const quickSearches = [
    'Italian Wool Blazer',
    'Egyptian Cotton Shirt',
    'Silk Panjabi',
    'Mercerized Polo',
    'Smart Flex Chino',
    'Leather Oxford'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="min-h-screen px-4 pt-12 pb-20 text-center sm:p-0">
        <div className="relative mx-auto mt-6 max-w-3xl bg-white shadow-2xl transition-all border border-neutral-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
              Search the Atelier
            </span>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-900 p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Input */}
          <div className="p-6 border-b border-neutral-100">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-neutral-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blazers, shirts, panjabis, SKU..."
                className="w-full bg-[#FAFAFA] border border-neutral-200 pl-12 pr-4 py-3.5 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick searches */}
            {!query && (
              <div className="mt-4 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="text-xs px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results list */}
          {query.trim() && (
            <div className="p-6 text-left max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-neutral-500">
                  {filteredProducts.length} Results Found
                </span>
                <a
                  href={hrefFor('shop', 'all')}
                  onClick={onClose}
                  className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
                >
                  View full catalog <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <p className="text-sm">No garments found matching "{query}".</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Try searching for "Blazer", "Shirt", "Panjabi", or "Polo".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((p) => (
                    <a
                      key={p.id}
                      href={hrefFor('product-detail', null, p.slug)}
                      onClick={onClose}
                      className="group flex gap-3 p-2.5 border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/80 cursor-pointer transition-all"
                    >
                      <div className="w-16 h-20 overflow-hidden bg-neutral-100 shrink-0">
                        <ImageWithFallback
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 truncate">
                          {p.categoryName} · {p.sku}
                        </span>
                        <h4 className="text-xs font-semibold text-neutral-900 truncate mt-0.5 group-hover:text-[#9A7B38] transition-colors">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-neutral-900 tabular-nums">
                            ৳{(p.salePrice ?? p.price).toLocaleString()}
                          </span>
                          {p.salePrice && (
                            <span className="text-[11px] text-neutral-400 line-through tabular-nums">
                              ৳{p.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
