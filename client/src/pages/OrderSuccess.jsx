import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home, MapPin, CreditCard } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatINR } from '../utils/currency';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${id}`);
          if (res.data.success) {
            setOrder(res.data.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Retrieving your confirmed order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-slate-600">Could not retrieve order details.</p>
        <Link to="/orders" className="text-blue-600 font-bold text-sm">
          Check My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Thank you for shopping with SHOPEZ!
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Your order has been recorded in our system. A confirmation notification has been registered for your account.
          </p>
        </div>

        {/* Order Identifier Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            Order #: <strong className="text-blue-600 font-mono">{order.orderNumber}</strong>
          </span>
          <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            Status: {order.status}
          </span>
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Order Details Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Package className="w-4 h-4 text-blue-600" />
          <span>Purchased Items Snapshot</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    Size: {item.size} • Qty: {item.quantity} • {formatINR(item.finalPrice)} each
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-slate-900">
                {formatINR(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
          {/* Shipping Address */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Delivery Address</span>
            </h4>
            <p className="font-semibold text-slate-700">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.pincode}
            </p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>

          {/* Payment & Totals */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Payment & Summary</span>
            </h4>
            <p>Method: <strong className="text-slate-800">{order.paymentMethod}</strong></p>
            <p>Status: <strong className="text-slate-800">{order.paymentStatus}</strong></p>
            <div className="pt-2 text-sm font-black text-slate-900">
              Total Paid: <span className="text-blue-600 font-sans">{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={`/orders/${order._id}`}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <span>View Detailed Order Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
