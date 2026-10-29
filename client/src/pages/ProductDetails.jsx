import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Minus,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImg, setSelectedImg] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
          setRelated(res.data.related || []);
          setSelectedImg(res.data.data.mainImg);
          if (res.data.data.sizes && res.data.data.sizes.length > 0) {
            setSelectedSize(res.data.data.sizes[0]);
          }
          setQuantity(1);
        }
      } catch (err) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  if (loading || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product details..." />
      </div>
    );
  }

  const finalPrice =
    product.finalPrice ||
    Math.round((product.price - (product.price * (product.discount || 0)) / 100) * 100) / 100;

  const isWish = isInWishlist(product._id);
  const allImages = [product.mainImg, ...(product.images || [])].filter(
    (img, index, self) => img && self.indexOf(img) === index
  );

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please choose a size first');
      return;
    }
    addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please choose a size first');
      return;
    }
    addToCart(product, selectedSize, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumbs */}
      <nav className="text-xs font-semibold text-slate-400 flex items-center space-x-2">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Shop</Link>
        <span>/</span>
        <Link
          to={`/products?category=${product.category?.slug}`}
          className="hover:text-blue-600"
        >
          {product.category?.name || 'Collection'}
        </Link>
        <span>/</span>
        <span className="text-slate-800 truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 relative group">
            <img
              src={selectedImg || product.mainImg}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImg === img
                      ? 'border-blue-600 ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Information & Actions */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {product.category?.name || 'SHOPEZ Collection'}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mt-1 leading-tight">
              {product.title}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center space-x-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 4.5)
                        ? 'fill-current'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">
                {product.rating || 4.8}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {product.numReviews || 38} verified customer reviews
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {formatINR(finalPrice)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through font-semibold">
                  {formatINR(product.price)}
                </span>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  Save {formatINR(product.price - finalPrice)} ({product.discount}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Size: <span className="text-blue-600">{selectedSize}</span>
                </label>
                <span className="text-xs text-slate-400 hover:text-blue-600 cursor-pointer">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 h-11 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Availability */}
          <div className="flex items-center space-x-2 text-xs">
            {product.stock > 0 ? (
              <div className="flex items-center space-x-1.5 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <Check className="w-3.5 h-3.5" />
                <span>In Stock ({product.stock} units available)</span>
              </div>
            ) : (
              <span className="text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity Selector + Add to Cart + Buy Now */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWish
                    ? 'border-rose-300 bg-rose-50 text-rose-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-rose-500 hover:border-slate-300'
                }`}
                title="Save to wishlist"
              >
                <Heart className={`w-5 h-5 ${isWish ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Buy Now</span>
            </button>
          </div>

          {/* Features and Delivery Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Fast 2-4 Day Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authenticity Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Free 30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">
              You Might Also Like
            </h2>
            <Link
              to={`/products?category=${product.category?.slug}`}
              className="text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Explore Category
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((relProd) => (
              <ProductCard key={relProd._id} product={relProd} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
