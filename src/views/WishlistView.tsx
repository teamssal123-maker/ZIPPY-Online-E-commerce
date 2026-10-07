import React from 'react';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/products/ProductCard';
import { hrefFor } from '../utils/routes';

export const WishlistView: React.FC = () => {
  const { wishlist, products, setWishlist } = useShop();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <Heart className="w-16 h-16 stroke-[1] text-neutral-300 mx-auto mb-4" />
        <h2 className="font-serif text-3xl font-bold text-neutral-900">Your Wishlist is Empty</h2>
        <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
          Save garments you admire while exploring our tailored collections.
        </p>
        <a
          href={hrefFor('shop')}
          className="mt-8 inline-block px-8 py-3.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Explore Catalog
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A7B38] font-semibold">
            Curated Wardrobe
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-0.5">
            MY SARTORIAL WISHLIST ({wishlistedProducts.length})
          </h1>
        </div>

        <button
          onClick={() => setWishlist([])}
          className="text-xs text-neutral-500 hover:text-red-600 underline flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Wishlist</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlistedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
