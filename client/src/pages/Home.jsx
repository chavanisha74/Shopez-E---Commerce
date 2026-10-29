import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [bannersRes, catsRes, prodsRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/products/featured')
        ]);

        if (bannersRes.data.success) setBanners(bannersRes.data.data);
        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (prodsRes.data.success) setFeaturedProducts(prodsRes.data.data);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Banner rotation timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading SHOPEZ flagship collections..." />
      </div>
    );
  }

  const currentBanner = banners[currentBannerIdx] || {
    title: 'Autumn & Winter Collection 2026',
    subtitle: 'Elevate your everyday aesthetic with tailored overcoats, refined knitwear, and performance sneakers.',
    badge: 'NEW ARRIVALS',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&auto=format&fit=crop&q=80',
    link: '/products'
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[520px] md:min-h-[580px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={currentBanner.banner}
            alt={currentBanner.title}
            className="w-full h-full object-cover object-center opacity-40 transition-opacity duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentBanner.badge || 'SHOPEZ EXCLUSIVE'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {currentBanner.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {currentBanner.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={currentBanner.link || '/products'}
                className="inline-flex items-center space-x-2.5 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all border border-white/10"
              >
                <span>Explore Catalog</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 right-8 z-10 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBannerIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentBannerIdx ? 'w-8 bg-blue-500' : 'w-2 bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center space-x-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Free Delivery</h4>
              <p className="text-xs text-slate-400">On all orders over ₹999</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Secure Payments</h4>
              <p className="text-xs text-slate-400">100% encrypted & verified</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">30-Day Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free guarantee</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 p-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">24/7 Concierge</h4>
              <p className="text-xs text-slate-400">Dedicated expert support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Curated by Department
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-300 font-medium">
                  {cat.productCount ? `${cat.productCount} Items` : 'Shop Collection'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending & Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs uppercase tracking-widest">
              <Flame className="w-4 h-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Featured Highlights
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center space-x-1 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>See Everything</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Mid-Page Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 md:p-14 shadow-2xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-full">
              SEASONAL SPECIAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Enjoy Up To 35% Off Footwear & Luxury Essentials
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Upgrade your day-to-day rotation with premium Japanese selvedge denim, Grade-A cashmere, and handcrafted leather boots.
            </p>
            <div className="pt-2">
              <Link
                to="/products?minDiscount=20"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                <span>Shop Discounted Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 lg:opacity-40 hidden md:block pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80"
              alt="Promo Shoes"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
