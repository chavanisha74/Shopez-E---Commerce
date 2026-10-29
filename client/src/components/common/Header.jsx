import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2">
        <span>✨ Free standard delivery on all orders over ₹999</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline">Use code <span className="text-amber-400 font-semibold">SHOPEZ2026</span> for extra 10% off</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                  SHOP<span className="text-blue-600">EZ</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 -mt-1 font-semibold">
                  E-Commerce
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/products" className="hover:text-blue-600 transition-colors">
                Shop All
              </Link>
              <Link to="/products?category=mens-fashion" className="hover:text-blue-600 transition-colors">
                Men
              </Link>
              <Link to="/products?category=womens-fashion" className="hover:text-blue-600 transition-colors">
                Women
              </Link>
              <Link to="/products?category=footwear" className="hover:text-blue-600 transition-colors">
                Footwear
              </Link>
              <Link to="/products?category=accessories" className="hover:text-blue-600 transition-colors">
                Accessories
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm rounded-full border border-transparent focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Link */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth Links */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 mr-1 hidden sm:inline" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user?.name}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          {user?.userType}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center space-x-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-1.5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full shadow-sm transition-all shadow-blue-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm rounded-xl border border-transparent focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600"
            >
              All Products
            </Link>
            <Link
              to="/products?category=mens-fashion"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600"
            >
              Men's Fashion
            </Link>
            <Link
              to="/products?category=womens-fashion"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600"
            >
              Women's Fashion
            </Link>
            <Link
              to="/products?category=footwear"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600"
            >
              Footwear & Sneakers
            </Link>
            <Link
              to="/products?category=accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600"
            >
              Accessories & Watches
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
