import React, { useState, useMemo } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Grid,
  LayoutGrid,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/products/ProductCard';
import { ProductSize } from '../types';

export const ShopView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    searchQuery,
    setSearchQuery
  } = useShop();

  // Filters State
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedFit, setSelectedFit] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available Sizes & Colors
  const allSizes: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];
  const allFits = ['Slim Fit', 'Tailored Fit', 'Regular Fit'];
  const colorsList = [
    { name: 'Navy', hex: '#1B2A4A' },
    { name: 'Charcoal', hex: '#333333' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Blue', hex: '#87CEEB' },
    { name: 'Khaki', hex: '#C3B091' },
    { name: 'Black', hex: '#111111' },
    { name: 'Emerald', hex: '#0B3B2B' }
  ];

  // Active Category info
  const activeCategory = categories.find((c) => c.slug === selectedCategorySlug);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategorySlug && selectedCategorySlug !== 'all') {
        if (selectedCategorySlug === 'sale') {
          if (!product.onSale) return false;
        } else if (selectedCategorySlug === 'new-arrivals') {
          if (!product.newArrival) return false;
        } else if (product.categoryId !== selectedCategorySlug) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCategory = product.categoryName.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesFabric = product.fabric.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesSku && !matchesFabric) return false;
      }

      // Price filter
      const effectivePrice = product.salePrice ?? product.price;
      if (effectivePrice < priceRange[0] || effectivePrice > priceRange[1]) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((s) => product.sizes.includes(s));
        if (!hasSize) return false;
      }

      // Color filter
      if (selectedColor) {
        const hasColor = product.colors.some((c) =>
          c.name.toLowerCase().includes(selectedColor.toLowerCase())
        );
        if (!hasColor) return false;
      }

      // Fit filter
      if (selectedFit && product.fit !== selectedFit) {
        return false;
      }

      // On Sale Only
      if (onSaleOnly && !product.onSale) {
        return false;
      }

      return true;
    });
  }, [
    products,
    selectedCategorySlug,
    searchQuery,
    priceRange,
    selectedSizes,
    selectedColor,
    selectedFit,
    onSaleOnly
  ]);

  // Sort Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      case 'price-desc':
        return list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return list.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  const toggleSize = (size: ProductSize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColor(null);
    setSelectedFit(null);
    setPriceRange([0, 20000]);
    setOnSaleOnly(false);
    setSelectedCategorySlug(null);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColor !== null ||
    selectedFit !== null ||
    priceRange[0] > 0 ||
    priceRange[1] < 20000 ||
    onSaleOnly ||
    selectedCategorySlug !== null ||
    searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Category Editorial Header */}
      <div className="mb-8 pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">
          <span>Home</span>
          <span>/</span>
          <span>Atelier</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-neutral-800 font-semibold">{activeCategory.name}</span>
            </>
          )}
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-neutral-900">
          {activeCategory ? activeCategory.name.toUpperCase() : 'ALL MENSWEAR COLLECTIONS'}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
          {activeCategory
            ? activeCategory.description
            : 'Tailored Italian wool suits, Egyptian Giza cotton shirts, festive embroidered panjabis, and full-grain leather accessories handcrafted for the distinguished man.'}
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-8 pr-4 border-r border-neutral-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-800" />
              <span className="text-xs uppercase tracking-widest font-bold text-neutral-900">
                Filters
              </span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#B00020] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Department / Category */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Department
            </h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setSelectedCategorySlug(null)}
                className={`w-full flex items-center justify-between py-1 text-left ${
                  selectedCategorySlug === null
                    ? 'font-bold text-neutral-950'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <span>All Departments</span>
                <span className="text-neutral-400 tabular-nums">({products.length})</span>
              </button>

              {categories.map((cat) => {
                const count =
                  cat.slug === 'sale'
                    ? products.filter((p) => p.onSale).length
                    : cat.slug === 'new-arrivals'
                    ? products.filter((p) => p.newArrival).length
                    : products.filter((p) => p.categoryId === cat.slug).length;

                const isSelected = selectedCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    className={`w-full flex items-center justify-between py-1 text-left ${
                      isSelected
                        ? 'font-bold text-neutral-950'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    <span className={cat.slug === 'sale' ? 'text-[#B00020]' : ''}>
                      {cat.name}
                    </span>
                    <span className="text-neutral-400 tabular-nums">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Price Range (৳ BDT)
            </h4>
            <div className="space-y-3">
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-neutral-700 font-mono tabular-nums">
                <span>৳{priceRange[0].toLocaleString()}</span>
                <span>Up to ৳{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Size
            </h4>
            <div className="grid grid-cols-5 gap-1.5">
              {allSizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`py-2 text-xs border text-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Color Palette
            </h4>
            <div className="flex flex-wrap gap-2">
              {colorsList.map((col) => {
                const isSelected = selectedColor === col.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(isSelected ? null : col.name)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                        : 'border-neutral-300 hover:scale-110'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Fit */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Tailoring Fit
            </h4>
            <div className="space-y-1.5 text-xs">
              {allFits.map((fit) => (
                <button
                  key={fit}
                  onClick={() => setSelectedFit(selectedFit === fit ? null : fit)}
                  className={`w-full text-left py-1 ${
                    selectedFit === fit ? 'font-bold text-neutral-900' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {selectedFit === fit ? '● ' : '○ '} {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2.5 text-xs text-neutral-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="w-4 h-4 accent-neutral-900 rounded-none cursor-pointer"
              />
              <span className="font-semibold text-[#B00020]">Sale Privileges Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {/* Top Bar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-neutral-200 gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-xs font-semibold uppercase tracking-wider text-neutral-800"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters ({hasActiveFilters ? 'Active' : 'All'})</span>
              </button>

              <span className="text-xs text-neutral-500 tabular-nums">
                Showing <strong>{sortedProducts.length}</strong> crafted garments
              </span>
            </div>

            {/* Sort Dropdown & Column switcher */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                >
                  <option value="featured">Featured Atelier</option>
                  <option value="newest">New Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Grid Column Switcher (Desktop) */}
              <div className="hidden xl:flex items-center border border-neutral-200 p-0.5">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 ${gridCols === 3 ? 'bg-neutral-900 text-white' : 'text-neutral-500'}`}
                  aria-label="3 columns"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 ${gridCols === 4 ? 'bg-neutral-900 text-white' : 'text-neutral-500'}`}
                  aria-label="4 columns"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
              <span className="text-neutral-400 text-[11px] uppercase tracking-wider">Active:</span>

              {selectedCategorySlug && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px]">
                  Category: {activeCategory?.name || selectedCategorySlug}
                  <button onClick={() => setSelectedCategorySlug(null)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSizes.map((sz) => (
                <span key={sz} className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px]">
                  Size: {sz}
                  <button onClick={() => toggleSize(sz)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedColor && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px]">
                  Color: {selectedColor}
                  <button onClick={() => setSelectedColor(null)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedFit && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px]">
                  Fit: {selectedFit}
                  <button onClick={() => setSelectedFit(null)} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {onSaleOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-[#B00020] text-[11px] font-semibold">
                  On Sale
                  <button onClick={() => setOnSaleOnly(false)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-[11px] text-neutral-500 hover:text-black underline ml-2 cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          {sortedProducts.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-neutral-200 p-8">
              <h3 className="font-serif text-lg font-bold text-neutral-800">
                No garments match your active filters.
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Try widening your price range, choosing different sizing, or resetting all filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 ${
                gridCols === 3
                  ? 'md:grid-cols-2 lg:grid-cols-3'
                  : 'md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
              } gap-4 sm:gap-6`}
            >
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col p-6 z-50 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <span className="text-xs uppercase tracking-widest font-bold text-neutral-900">
                Filter Collections
              </span>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-900 mb-2">Category</h4>
                <div className="space-y-1 text-xs">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategorySlug(c.slug)}
                      className={`block py-1 text-left ${
                        selectedCategorySlug === c.slug ? 'font-bold text-black' : 'text-neutral-600'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-bold uppercase text-neutral-900 mb-2">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 text-xs border ${
                        selectedSizes.includes(sz)
                          ? 'bg-neutral-900 text-white'
                          : 'border-neutral-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 mt-auto space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider"
              >
                Apply Filters ({sortedProducts.length})
              </button>
              <button
                onClick={clearAllFilters}
                className="w-full py-2 text-xs text-neutral-500 hover:text-black text-center"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
