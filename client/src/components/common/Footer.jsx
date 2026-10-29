import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      toast.success('Thank you for subscribing to SHOPEZ newsletters!');
      setEmail('');
    } else {
      toast.error('Please enter a valid email address.');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white">
                SHOP<span className="text-blue-500">EZ</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              SHOPEZ is your premier online destination for luxury apparel, curated lifestyle sneakers, and premium accessories designed for modern life.
            </p>
            <div className="space-y-2 text-sm text-slate-400 pt-2">
              <p className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>100 Innovation Way, Suite 400, Tech City</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+1 (800) 555-SHOPEZ (746-739)</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@shopez.com</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/products?category=mens-fashion" className="hover:text-white transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/products?category=womens-fashion" className="hover:text-white transition-colors">
                  Women's Wardrobe
                </Link>
              </li>
              <li>
                <Link to="/products?category=footwear" className="hover:text-white transition-colors">
                  Sneakers & Footwear
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-white transition-colors">
                  Watches & Accessories
                </Link>
              </li>
              <li>
                <Link to="/products?category=activewear" className="hover:text-white transition-colors">
                  Activewear & Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Customer Support
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Manage Account
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => toast.success('Standard delivery is 3-5 business days across India. Free delivery over ₹999!')}>
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => toast.success('Enjoy hassle-free returns within 30 days of delivery!')}>
                  Returns & Refunds
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => toast.success('SHOPEZ uses end-to-end encrypted cookie-based authentication.')}>
                  Privacy & Security
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              Stay in the Loop
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold bg-emerald-950/60 p-3 rounded-xl border border-emerald-800">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>You are subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SHOPEZ Inc. All rights reserved. Built with MERN Stack.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
