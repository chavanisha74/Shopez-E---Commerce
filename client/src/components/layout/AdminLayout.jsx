import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingCart,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products Catalog', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Promotional Banners', path: '/admin/banners', icon: ImageIcon },
    { name: 'Customer Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'User Management', path: '/admin/customers', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                SHOP<span className="text-blue-500">EZ</span>
              </span>
              <span className="text-[10px] uppercase block tracking-widest text-slate-400 font-bold -mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Storefront & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Go to Public Store</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 uppercase tracking-wider">
              Live Production Store
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                A
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                <p className="text-slate-400 text-[10px]">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex">
            <div className="w-64 bg-slate-900 h-full p-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-white font-black text-lg">SHOPEZ Admin</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="block text-xs font-bold text-emerald-400 py-1"
                >
                  View Storefront
                </Link>
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="block text-xs font-bold text-rose-400 py-1"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Nested Route Page */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
