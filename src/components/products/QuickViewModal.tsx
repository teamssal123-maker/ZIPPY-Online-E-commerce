import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Heart, Ruler, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductSize, ColorVariant } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { hrefFor, applyHash } from '../../utils/routes';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsSizeGuideOpen
  } = useShop();

  const product = quickViewProduct;

  const [selectedSize, setSelectedSize] = useState<ProductSize>('L');
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'L');
      setSelectedColor(product.colors[0] || null);
      setSelectedImage(product.images[0] || '');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice ?? product.price;

  const handleAddToCart = () => {
    if (!selectedColor) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setQuickViewProduct(null);
  };

  const handleBuyNow = () => {
    if (!selectedColor) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setQuickViewProduct(null);
    applyHash('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 text-neutral-400 hover:text-black transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Col */}
          <div className="p-6 bg-[#F6F6F4] flex flex-col justify-between">
            <div className="aspect-[3/4] w-full overflow-hidden bg-white shadow-xs">
              <ImageWithFallback
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-16 shrink-0 border overflow-hidden transition-all ${
                      selectedImage === img
                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Purchasing Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-medium">
                <span>{product.categoryName}</span>
                <span>·</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xl font-bold text-neutral-900 tabular-nums">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-neutral-400 line-through tabular-nums">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
                {product.salePrice && (
                  <span className="text-[11px] font-bold text-[#B00020] uppercase tracking-wider">
                    Save ৳{(product.price - product.salePrice).toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                {product.shortDescription || product.description}
              </p>

              {/* Color Selection */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-2">
                  <span>Color: {selectedColor?.name}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        selectedColor?.name === col.name
                          ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {selectedColor?.name === col.name && (
                        <Check
                          className={`w-4 h-4 ${
                            col.hex === '#FFFFFF' || col.hex === '#FDFBF7'
                              ? 'text-black'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-2">
                  <span>Size: {selectedSize}</span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                            : 'border-neutral-200 text-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-semibold text-neutral-900">Quantity</span>
                <div className="flex items-center border border-neutral-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-neutral-600 hover:text-black text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-semibold tabular-nums min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-neutral-600 hover:text-black text-sm"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-neutral-400">
                  Stock available in atelier
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-4 border-t border-neutral-100 space-y-2.5">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 border transition-colors ${
                    isWishlisted
                      ? 'border-[#B00020] text-[#B00020]'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? 'fill-[#B00020]' : ''}`}
                  />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3 border border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
              >
                Instant Checkout
              </button>

              <div className="text-center pt-2">
                <a
                  href={hrefFor('product-detail', null, product.slug)}
                  onClick={() => setQuickViewProduct(null)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline inline-flex items-center gap-1"
                >
                  <span>View Full Product Specifications</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
