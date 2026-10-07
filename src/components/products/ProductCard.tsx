import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { hrefFor } from '../../utils/routes';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    setQuickViewProduct,
    toggleWishlist,
    isInWishlist,
    addToCart
  } = useShop();

  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const displayImage =
    isHovered && product.images.length > 1
      ? product.images[1]
      : product.images[0];

  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <div
      className="group relative flex flex-col bg-white border border-neutral-200/70 hover:border-neutral-400 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <a
        href={hrefFor('product-detail', null, product.slug)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#F6F6F4] cursor-pointer block"
      >
        <ImageWithFallback
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Minimal Unboxed Editorial Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#B00020] text-white px-2 py-0.5">
              -{discountPercent}%
            </span>
          )}
          {product.newArrival && discountPercent === 0 && (
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#111111] text-white px-2 py-0.5">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isWishlisted
              ? 'bg-white text-[#B00020] shadow-md'
              : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 shadow-sm'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-[#B00020]' : 'stroke-[1.5]'}`}
          />
        </button>

        {/* Quick Action Overlays on Hover */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 py-2 px-3 bg-white text-neutral-900 text-[11px] font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, product.sizes[0], product.colors[0], 1);
            }}
            className="p-2 bg-neutral-900 hover:bg-black text-white transition-colors shadow-sm"
            title={`Quick Add (${product.sizes[0]})`}
            aria-label="Add to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </a>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata kicker: zero-pill discipline */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
            <span>{product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{product.sku}</span>
          </div>

          <a
            href={hrefFor('product-detail', null, product.slug)}
            className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-[#9A7B38] transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </a>

          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
            {product.fabric}
          </p>
        </div>

        {/* Price & Color Swatches */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900 tabular-nums">
              ৳{(product.salePrice ?? product.price).toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-xs text-neutral-400 line-through tabular-nums">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Color Dots */}
          <div className="flex items-center -space-x-1">
            {product.colors.slice(0, 3).map((col, idx) => (
              <span
                key={idx}
                className="w-3 h-3 rounded-full border border-white shadow-xs"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[9px] text-neutral-400 pl-1.5 font-medium">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
