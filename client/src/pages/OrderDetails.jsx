import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  MapPin,
  CreditCard,
  ArrowLeft,
  XCircle,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Confirm order cancellation? Inventory will be restored.')) return;
    try {
      const res = await api.post(`/orders/${id}/cancel`, {
        reason: 'Customer initiated cancellation'
      });
      if (res.data.success) {
        toast.success('Order has been cancelled.');
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReturn = async () => {
    const reason = prompt('Please describe the reason for return:');
    if (!reason) return;
    try {
      const res = await api.post(`/orders/${id}/return`, { reason });
      if (res.data.success) {
        toast.success('Return requested. Our courier partner will contact you.');
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order timeline..." />
      </div>
    );
  }

  const steps = [
    { name: 'Pending', label: 'Order Placed' },
    { name: 'Confirmed', label: 'Confirmed' },
    { name: 'Processing', label: 'Processing' },
    { name: 'Shipped', label: 'Shipped' },
    { name: 'Out for Delivery', label: 'Out for Delivery' },
    { name: 'Delivered', label: 'Delivered' }
  ];

  const currentStepIdx = steps.findIndex((s) => s.name === order.status);
  const isCancelled = order.status === 'Cancelled';
  const isReturned = order.status === 'Returned';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back & actions bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        {/* Cancellation / Return actions */}
        <div className="flex items-center space-x-3">
          {['Pending', 'Confirmed', 'Processing'].includes(order.status) && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              Cancel Order
            </button>
          )}

          {order.status === 'Delivered' && (
            <button
              onClick={handleReturn}
              className="px-4 py-2 rounded-xl text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Return</span>
            </button>
          )}
        </div>
      </div>

      {/* Order Status Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Order Details
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Status</span>
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1">
              {order.status}
            </span>
          </div>
        </div>

        {/* Tracking number if available */}
        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Carrier Tracking ID:</span>
              <strong className="font-mono text-slate-900">{order.trackingNumber}</strong>
            </div>
            <span className="text-emerald-600 font-bold">In Transit</span>
          </div>
        )}

        {/* Visual Progress Timeline */}
        {!isCancelled && !isReturned ? (
          <div className="py-6 overflow-x-auto">
            <div className="min-w-[500px] flex items-center justify-between relative">
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 -z-0" />
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div
                    key={step.name}
                    className="flex flex-col items-center relative z-10 space-y-2 text-center"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        isCurrent
                          ? 'text-blue-600 font-bold'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm font-semibold flex items-center space-x-2">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>This order was {order.status.toLowerCase()} ({order.cancelReason || 'No reason provided'}).</span>
          </div>
        )}
      </div>

      {/* Ordered Items Snapshot */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Package className="w-4 h-4 text-blue-600" />
          <span>Items in this Order ({order.items.length})</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    Size: {item.size} • Qty: {item.quantity} • Unit: ${item.finalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-base font-black text-slate-900">
                ${item.lineTotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial summary breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs sm:text-sm text-slate-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.subtotal?.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>Discount</span>
              <span>-${order.discountAmount?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${order.shippingFee?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax</span>
            <span>${order.taxAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span className="text-blue-600">${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address & Payment Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Shipping Destination</span>
          </h4>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.pincode}
            </p>
            <p>Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Payment & Settlement</span>
          </h4>
          <div className="text-xs text-slate-600 space-y-1">
            <p>Method: <strong className="text-slate-800">{order.paymentMethod}</strong></p>
            <p>Status: <strong className="text-slate-800">{order.paymentStatus}</strong></p>
            {order.paymentDetails?.transactionId && (
              <p className="font-mono text-[11px] text-slate-400">
                TxID: {order.paymentDetails.transactionId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
