import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Check,
  Share2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductSize, ColorVariant, ProductReview } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../api/client';
import { hrefFor, applyHash } from '../utils/routes';

export const ProductDetailView: React.FC = () => {
  const {
    products,
    selectedProductSlug,
    setSelectedProductSlug,
    setSelectedCategorySlug,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsSizeGuideOpen,
    setActiveView,
    showToast,
    apiAvailable
  } = useShop();

  const product =
    products.find(
      (p) =>
        p.slug?.toLowerCase() === selectedProductSlug?.toLowerCase() ||
        p.id?.toLowerCase() === selectedProductSlug?.toLowerCase()
    ) || products[0];

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-neutral-900">Garment not found</h2>
        <a
          href={hrefFor('shop')}
          className="mt-6 inline-block px-8 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider"
        >
          Browse Collection
        </a>
      </div>
    );
  }

  const [selectedImage, setSelectedImage] = useState<string>(product.images[0]);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState<ColorVariant>(product.colors[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  // Customer Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([
    {
      id: 'rev-1',
      productId: product.id,
      authorName: 'Tanvir Ahmed',
      rating: 5,
      date: 'September 18, 2026',
      comment:
        'The drape and shoulder construction of this blazer is on par with bespoke Italian suiting houses. Wore it to a high-profile corporate gala in Dhaka and received countless compliments.',
      verifiedPurchase: true
    },
    {
      id: 'rev-2',
      productId: product.id,
      authorName: 'Rashid Al-Mamun',
      rating: 5,
      date: 'September 12, 2026',
      comment:
        'Fabric is remarkably breathable and comfortable in our humid weather. The horn buttons and clean lapel stitching showcase the premium quality.',
      verifiedPurchase: true
    }
  ]);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Sync image when product changes
  React.useEffect(() => {
    setSelectedImage(product.images[0]);
    setSelectedSize(product.sizes[0] || 'L');
    setSelectedColor(product.colors[0]);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (apiAvailable) {
      api.reviews(product.id).then((next) => {
        if (next.length) setReviews(next);
      }).catch(() => undefined);
    }
  }, [product.id, apiAvailable]);

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice ?? product.price;
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setActiveView('checkout');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      showToast('Please fill out all review fields.', 'error');
      return;
    }
    if (apiAvailable) {
      try {
        const rev = await api.addReview(product.id, {
          authorName: newReviewAuthor.trim(),
          rating: newReviewRating,
          comment: newReviewComment.trim()
        });
        setReviews([rev, ...reviews]);
        setNewReviewAuthor('');
        setNewReviewComment('');
        setShowReviewForm(false);
        showToast('Thank you for reviewing your Zippy garment.');
        return;
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Unable to submit review.', 'error');
        return;
      }
    }
    const rev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      authorName: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Just now',
      comment: newReviewComment.trim(),
      verifiedPurchase: true
    };
    setReviews([rev, ...reviews]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setShowReviewForm(false);
    showToast('Thank you for reviewing your Zippy garment.');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Garment link copied to clipboard.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 font-medium mb-8">
        <a
          href={hrefFor('home')}
          onClick={(e) => {
            e.preventDefault();
            setSelectedCategorySlug(null);
            setSelectedProductSlug(null);
            setActiveView('home');
            applyHash('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="hover:text-black transition-colors cursor-pointer"
        >
          Home
        </a>
        <ChevronRight className="w-3 h-3" />
        <a
          href={hrefFor('shop', product.categoryId)}
          className="hover:text-black transition-colors"
        >
          {product.categoryName}
        </a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main PDP Grid: Gallery Left + Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 pb-2 sm:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border transition-all cursor-pointer ${
                    selectedImage === img
                      ? 'border-neutral-900 ring-1 ring-neutral-900'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Shot */}
          <div className="flex-1 aspect-[3/4] overflow-hidden bg-[#F6F6F4] border border-neutral-200 shadow-xs relative">
            <ImageWithFallback
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Editorial Badge */}
            {product.salePrice && (
              <div className="absolute top-4 left-4 bg-[#B00020] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                Sale Privilege
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="border-b border-neutral-200 pb-6">
            {/* Kicker */}
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-neutral-400 font-medium">
              <span>
                {product.categoryName} · {product.sku}
              </span>
              <button
                onClick={handleShare}
                className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[10px]">Share</span>
              </button>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-2">
              {product.name}
            </h1>

            {/* Price & Rating */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-neutral-900 tabular-nums">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-base text-neutral-400 line-through tabular-nums">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
                {product.salePrice && (
                  <span className="text-xs font-bold text-[#B00020] uppercase tracking-wider">
                    Save ৳{(product.price - product.salePrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <div className="flex items-center text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold text-neutral-900 tabular-nums">{product.rating}</span>
                <span className="text-neutral-400">({reviews.length} reviews)</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mt-4 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variants Selection Module */}
          <div className="py-6 space-y-6 border-b border-neutral-200">
            {/* Colors */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-2">
                <span>Color: {selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col)}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor.name === col.name
                        ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                        : 'border-neutral-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {selectedColor.name === col.name && (
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

            {/* Sizing */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-2">
                <span>Size: {selectedSize}</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Matrix</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const stock = product.stock[size] ?? 5;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-xs border text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                          : 'border-neutral-200 text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      <div className="font-semibold">{size}</div>
                      <div className="text-[9px] opacity-75 tabular-nums">
                        {stock > 0 ? `${stock} left` : 'Sold out'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-900">Quantity:</span>
              <div className="flex items-center border border-neutral-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-neutral-600 hover:text-black text-sm"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-semibold tabular-nums text-center min-w-[36px]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-neutral-600 hover:text-black text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-neutral-400">
                Total: <strong className="text-neutral-900 font-mono">৳{(currentPrice * quantity).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="py-6 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 border transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'border-[#B00020] text-[#B00020]'
                    : 'border-neutral-300 text-neutral-600 hover:border-neutral-500'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#B00020]' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 border border-neutral-900 text-neutral-900 text-xs font-bold uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
            >
              Instant Buy Now
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="bg-[#F9F9F8] p-4 border border-neutral-200 text-xs space-y-3 text-neutral-700">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#9A7B38] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Delivery in Bangladesh:</strong>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Dhaka: 24–48 hours (৳80, free over ৳3,000) · Outside Dhaka: 3–5 days (৳150)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#9A7B38] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">7-Day Boutique Exchange:</strong>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Exchange size or style easily at any Zippy store in Gulshan, Banani, Dhanmondi, or Uttara.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#9A7B38] shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">100% Authentic Atelier Guarantee:</strong>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Crafted with genuine fabrics certified by international suiting standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Tabs for Specifications & Care */}
      <div className="mt-16 border-t border-neutral-200 pt-12">
        <div className="flex border-b border-neutral-200 gap-6 text-xs font-bold uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Fabric & Tailoring Specifications
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'care'
                ? 'border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Care Instructions
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Delivery & Returns
          </button>
        </div>

        <div className="py-6 text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-3xl">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-[#F9F9F8] p-4 border border-neutral-200">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                    Fabric Composition
                  </span>
                  <span className="font-semibold text-neutral-900">{product.fabric}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                    Cut & Silhouette
                  </span>
                  <span className="font-semibold text-neutral-900">{product.fit}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                    Style Code
                  </span>
                  <span className="font-mono text-neutral-900">{product.styleCode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-semibold">
                    Origin & Tailoring
                  </span>
                  <span className="font-semibold text-neutral-900">Bespoke Atelier, Dhaka</span>
                </div>
              </div>
              <p>
                Each stitch is calibrated to preserve the structural memory of the garment,
                ensuring natural elasticity and sharp silhouette across years of executive wear.
              </p>
            </div>
          )}

          {activeTab === 'care' && (
            <ul className="list-disc pl-5 space-y-2">
              {product.careInstructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
              <li>Store inside breathable cotton garment bags away from direct sunlight.</li>
            </ul>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <p>
                <strong>Inside Dhaka:</strong> Delivered via Zippy Express Rider within 24–48
                hours. Cash on Delivery and verified digital payment options available at checkout.
              </p>
              <p>
                <strong>Outside Dhaka:</strong> Dispatched within 24 hours via Pathao or Sundarban
                Courier. Tracking number provided via SMS and order portal.
              </p>
              <p>
                <strong>Boutique Exchange:</strong> If you need a size alteration or want another
                color, present your invoice at any Zippy store within 7 days in original condition.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-16 border-t border-neutral-200 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-neutral-900">
              CLIENT REVIEWS & TESTIMONIALS
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Feedback from distinguished patrons who purchased this garment.
            </p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors self-start sm:self-auto cursor-pointer"
          >
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Review Submission Form */}
        {showReviewForm && (
          <form onSubmit={handleAddReview} className="my-8 p-6 bg-[#F9F9F8] border border-neutral-200 max-w-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Submit Your Review
            </h4>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={newReviewAuthor}
                onChange={(e) => setNewReviewAuthor(e.target.value)}
                placeholder="e.g. Navid Chowdhury"
                className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= newReviewRating
                          ? 'text-[#D4AF37] fill-current'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Garment Feedback & Fit Impressions
              </label>
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                rows={3}
                placeholder="Share your experience with tailoring, fabric texture, and fit..."
                className="w-full bg-white border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
            >
              Post Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="mt-8 space-y-6 max-w-3xl">
          {reviews.map((rev) => (
            <div key={rev.id} className="border-b border-neutral-100 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900">{rev.authorName}</span>
                  {rev.verifiedPurchase && (
                    <span className="text-[10px] text-green-700 font-semibold bg-green-50 px-2 py-0.5">
                      Verified Buyer
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-400">{rev.date}</span>
              </div>

              <div className="flex items-center text-[#D4AF37] my-1.5">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-neutral-200 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7B38] font-semibold">
                Complete Your Wardrobe
              </span>
              <h3 className="font-serif text-2xl font-bold text-neutral-900 mt-1">
                RELATED SARTORIAL PIECES
              </h3>
            </div>
            <a
              href={hrefFor('shop', product.categoryId)}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-black underline"
            >
              View All {product.categoryName}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
