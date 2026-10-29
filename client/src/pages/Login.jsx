import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect target
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || location.state?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    try {
      setLoading(true);
      const user = await login(identifier, password);
      if (user.userType === 'admin' && redirectTarget === '/') {
        navigate('/admin');
      } else {
        navigate(redirectTarget);
      }
    } catch (err) {
      // Error handled in AuthContext with toast
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill for tester convenience
  const fillCredentials = (type) => {
    if (type === 'admin') {
      setIdentifier('admin@shopez.com');
      setPassword('Admin@shopez2026');
    } else {
      setIdentifier('alex@example.com');
      setPassword('User@shopez2026');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 text-blue-600">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              SHOP<span className="text-blue-600">EZ</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your orders, saved addresses, and bag.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email or Username</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Test Login Fillers */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 text-center">
            Demo Credentials (Click to pre-fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold rounded-lg text-slate-600 transition-colors"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('customer')}
              className="py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold rounded-lg text-slate-600 transition-colors"
            >
              👤 Customer Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
