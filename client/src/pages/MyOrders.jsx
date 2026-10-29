import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Eye, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      const res = await api.post(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by customer from orders dashboard'
      });
      if (res.data.success) {
        toast.success('Order cancelled and inventory restored.');
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your orders..." />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Package}
          title="No orders placed yet"
          description="You haven't placed any orders with SHOPEZ. Start browsing our curated collections to find your favorite products."
          actionText="Discover Products"
          actionLink="/products"
        />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      Processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      'Out for Delivery': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
      Returned: 'bg-slate-100 text-slate-700 border-slate-300'
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track active shipments, view receipts, and review past deliveries.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isCancellable = ['Pending', 'Confirmed', 'Processing'].includes(
            order.status
          );

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Header: Order #, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items Thumbnails row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 overflow-x-auto py-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                      title={item.title}
                    />
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs font-bold text-slate-400">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block">Total Amount</span>
                  <span className="text-lg font-black text-slate-900">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3 text-xs font-bold">
                {isCancellable && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
