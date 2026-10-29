import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, Search, Eye, Truck, Check, X, Filter } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50');

      const res = await api.get(`/admin/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingNumber || '');
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      const res = await api.patch(`/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        paymentStatus: newPaymentStatus
      });

      if (trackingInput !== selectedOrder.trackingNumber) {
        await api.patch(`/admin/orders/${selectedOrder._id}/tracking`, {
          trackingNumber: trackingInput
        });
      }

      if (res.data.success) {
        toast.success('Order status updated successfully');
        setIsModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Customer Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor incoming orders, transition delivery states, and register tracking IDs.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="md" text="Loading customer orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No orders match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
                      <p className="text-[10px] text-slate-400">{order.userId?.email || 'Guest'}</p>
                    </td>

                    <td className="p-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      ${order.totalAmount?.toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span className="block font-semibold text-slate-800 text-[11px]">
                        {order.paymentMethod}
                      </span>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-all inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  Order Management
                </span>
                <h3 className="text-lg font-black text-slate-900 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status change selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Order Fulfillment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled (Restores Stock)</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700">Courier Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-98324-FEDEX"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Items summary */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-800">Purchased Items</h4>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-xs">{item.title}</p>
                        <p className="text-[10px] text-slate-400">
                          Size: {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">${item.lineTotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
