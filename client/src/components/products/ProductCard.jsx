import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isWish = isInWishlist(product._id);
  const finalPrice =
    product.finalPrice ||
    Math.round((product.price - (product.price * (product.discount || 0)) / 100) * 100) / 100;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard';
    addToCart(product, defaultSize, 1);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <Link
        to={`/products/${product._id}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100 block"
      >
        <img
          src={product.mainImg}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discount > 0 && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
              {product.discount}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWish
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
          title={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWish ? 'fill-current' : ''}`} />
        </button>

        {/* Stock warning if low */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-semibold py-0.5 px-2 rounded-md text-center">
            Only {product.stock} units left!
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-blue-600 text-[10px]">
              {product.category?.name || 'Collection'}
            </span>
            <div className="flex items-center space-x-1 text-amber-500 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating || '4.8'}</span>
              <span className="text-slate-400 font-normal">({product.numReviews || 12})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="font-bold text-slate-800 text-sm hover:text-blue-600 line-clamp-1 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Available Sizes preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[10px] font-medium text-slate-400 self-center">
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <span className="text-base font-extrabold text-slate-900">
                {formatINR(finalPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(product.price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl font-medium text-xs flex items-center space-x-1.5 transition-colors ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
            title="Quick add to bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
