import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/currency';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { items, totals, fetchCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate shipping address from user profile
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (user) {
      const defaultAddr = user.savedAddresses?.find((a) => a.isDefault) || user.savedAddresses?.[0];
      if (defaultAddr) {
        setShippingAddress({
          fullName: defaultAddr.fullName || user.name || '',
          phone: defaultAddr.phone || user.mobile || '',
          street: defaultAddr.street || user.address || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          pincode: defaultAddr.pincode || user.pincode || ''
        });
      } else {
        setShippingAddress((prev) => ({
          ...prev,
          fullName: user.name || '',
          phone: user.mobile || '',
          street: user.address || '',
          pincode: user.pincode || ''
        }));
      }
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      toast.error('Please complete all shipping address fields.');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      navigate('/products');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/orders', {
        shippingAddress,
        paymentMethod
      });

      if (res.data.success) {
        toast.success('Order placed successfully!');
        await fetchCart(); // refresh empty cart
        navigate(`/order-success/${res.data.data._id}`, {
          state: { order: res.data.data }
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please check stock availability.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your delivery details and choose your preferred payment option.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Shipping & Payment Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center">
                1
              </div>
              <h2 className="text-lg font-bold">Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Full Recipient Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. +1 (555) 019-2834"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pincode / ZIP Code *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="e.g. 10001"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Street Address & Apartment *</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Suite 4B"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Springfield"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">State / Province *</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Oregon"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center">
                2
              </div>
              <h2 className="text-lg font-bold">Select Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash On Delivery Option */}
              <label
                className={`p-5 rounded-2xl border-2 flex items-start space-x-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pay safely with cash or mobile POS when your package arrives at your doorstep.
                  </p>
                </div>
              </label>

              {/* Online Payment Option */}
              <label
                className={`p-5 rounded-2xl border-2 flex items-start space-x-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'Online Payment'
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online Payment"
                  checked={paymentMethod === 'Online Payment'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Online Payment (Card / Test)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Simulate instant card/online gateway verification in test sandbox mode.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-extrabold text-lg text-slate-900">
              Review Bag ({items.length} items)
            </h3>

            {/* Items Mini List */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item._id || item.productId} className="flex items-center space-x-3">
                  <img
                    src={item.imageSnapshot}
                    alt={item.titleSnapshot}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {item.titleSnapshot}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {formatINR((item.finalPriceSnapshot || item.priceSnapshot) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs sm:text-sm border-t border-slate-100 pt-4 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatINR(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {totals.shippingFee === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    formatINR(totals.shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatINR(totals.taxAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
              <span className="text-base font-bold text-slate-900">Total to Pay</span>
              <span className="text-2xl font-black text-blue-600">
                {formatINR(totals.totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Order...' : 'Confirm & Place Order'}</span>
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted, PCI-compliant order processing</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
