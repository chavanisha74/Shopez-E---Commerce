import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import EmptyState from '../components/common/EmptyState';

export default function Cart() {
  const { items, totals, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping bag is empty"
          description="Looks like you haven't added anything to your cart yet. Explore our latest arrivals to discover the best styles."
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Shopping Bag
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your selected items before proceeding to secure checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const finalPrice =
              item.finalPriceSnapshot ||
              item.priceSnapshot -
                (item.priceSnapshot * (item.discountSnapshot || 0)) / 100;

            const lineTotal = Math.round(finalPrice * item.quantity * 100) / 100;

            return (
              <div
                key={item._id || item.productId}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product image & title */}
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/products/${item.productId}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0"
                  >
                    <img
                      src={item.imageSnapshot}
                      alt={item.titleSnapshot}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {item.titleSnapshot}
                    </Link>

                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>Size: <strong className="text-slate-800">{item.size || 'Standard'}</strong></span>
                      <span>•</span>
                      <span>
                        {formatINR(finalPrice)} each
                      </span>
                    </div>

                    {item.discountSnapshot > 0 && (
                      <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {item.discountSnapshot}% Discount Applied
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity controller & Line total */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => updateItem(item._id || item.productId, item.quantity - 1)}
                      className="p-1 text-slate-600 hover:bg-white rounded-lg transition-colors"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(item._id || item.productId, item.quantity + 1)}
                      className="p-1 text-slate-600 hover:bg-white rounded-lg transition-colors"
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 block">
                      {formatINR(lineTotal)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item._id || item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-extrabold text-lg text-slate-900">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm border-b border-slate-100 pb-4">
              <div className="flex justify-between text-slate-600">
                <span>Original Subtotal</span>
                <span>{formatINR(totals.subtotal)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount Savings</span>
                  <span>-{formatINR(totals.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Estimate</span>
                <span>
                  {totals.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatINR(totals.shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated GST (5%)</span>
                <span>{formatINR(totals.taxAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-base font-bold text-slate-900">Estimated Total</span>
              <span className="text-2xl font-black text-blue-600">
                {formatINR(totals.totalAmount)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Perks */}
            <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>SSL Encrypted Checkout</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Free returns within 30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
