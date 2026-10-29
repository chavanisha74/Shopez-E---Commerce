import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    mainImg: '',
    images: [],
    category: '',
    sizes: 'S, M, L, XL',
    gender: 'All',
    price: '',
    discount: '0',
    stock: '15',
    isFeatured: false,
    isActive: true
  };
  const [form, setForm] = useState(initialForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('all', 'true'); // admin flag to see all
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('limit', '50');

      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories?all=true')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle image file upload to server
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      setUploadingImg(true);
      const res = await api.post('/upload/single', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setForm((prev) => ({ ...prev, mainImg: res.data.url }));
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
      ...initialForm,
      category: categories[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setIsEditing(true);
    setCurrentId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      mainImg: product.mainImg,
      images: product.images || [],
      category: product.category?._id || product.category,
      sizes: product.sizes?.join(', ') || 'S, M, L, XL',
      gender: product.gender || 'All',
      price: String(product.price),
      discount: String(product.discount || 0),
      stock: String(product.stock || 0),
      isFeatured: !!product.isFeatured,
      isActive: product.isActive !== undefined ? !!product.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete product "${title}"?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        toast.success('Product removed from catalog');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.mainImg || !form.category || !form.price) {
      toast.error('Please fill all required product fields');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      mainImg: form.mainImg,
      category: form.category,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      gender: form.gender,
      price: parseFloat(form.price),
      discount: parseFloat(form.discount || 0),
      stock: parseInt(form.stock, 10) || 0,
      isFeatured: form.isFeatured,
      isActive: form.isActive
    };

    try {
      if (isEditing) {
        await api.patch(`/products/${currentId}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage merchandise, inventory stocks, prices, and visual media.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner size="md" text="Loading merchandise..." />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Final Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <img
                        src={prod.mainImg}
                        alt={prod.title}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 max-w-xs truncate">{prod.title}</p>
                        <p className="text-[10px] text-slate-400">
                          Sizes: {prod.sizes?.join(', ') || 'Standard'}
                        </p>
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {prod.category?.name || 'Unassigned'}
                    </td>

                    <td className="p-4 font-medium text-slate-500">
                      ${prod.price?.toFixed(2)}
                      {prod.discount > 0 && (
                        <span className="ml-1 text-[10px] text-rose-500 font-bold">
                          (-{prod.discount}%)
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      ${prod.finalPrice?.toFixed(2)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                          prod.stock <= 5
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {prod.stock} left
                      </span>
                    </td>

                    <td className="p-4">
                      {prod.isFeatured ? (
                        <span className="text-blue-600 font-bold">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id, prod.title)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Product Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Classic Trench Coat"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Detailed material, cut, and care instructions..."
                />
              </div>

              {/* Image Upload or URL */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700">Main Image URL or Local Upload *</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={form.mainImg}
                    onChange={(e) => setForm({ ...form, mainImg: e.target.value })}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                  />
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImg ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.mainImg && (
                  <div className="mt-2 flex items-center space-x-2">
                    <img
                      src={form.mainImg}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-100"
                    />
                    <span className="text-[11px] text-slate-400">Main image preview</span>
                  </div>
                )}
              </div>

              {/* Category & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Gender Target</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="All">All</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              {/* Price, Discount, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="99.00"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Inventory *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Available Sizes (Comma Separated)</label>
                <input
                  type="text"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. S, M, L, XL or 8, 9, 10, 11"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-bold text-slate-700">Feature on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-bold text-slate-700">Active (Visible in Catalog)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
