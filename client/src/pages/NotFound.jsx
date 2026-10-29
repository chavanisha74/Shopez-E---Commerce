import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-black">
        404
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-black text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The page you requested could not be found or may have been moved.
        </p>
      </div>
      <div className="flex space-x-3">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    </div>
  );
}
