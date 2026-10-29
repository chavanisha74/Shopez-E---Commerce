import React, { useEffect, useState, useCallback } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const initialForm = {
    title: '',
    subtitle: '',
    badge: 'SPECIAL OFFER',
    banner: '',
    link: '/products',
    isActive: true
  };
  const [form, setForm] = useState(initialForm);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners?all=true');
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

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
        setForm((prev) => ({ ...prev, banner: res.data.url }));
        toast.success('Banner image uploaded');
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
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setIsEditing(true);
    setCurrentId(b._id);
    setForm({
      title: b.title,
      subtitle: b.subtitle || '',
      badge: b.badge || 'PROMO',
      banner: b.banner,
      link: b.link || '/products',
      isActive: b.isActive !== undefined ? b.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      const res = await api.delete(`/banners/${id}`);
      if (res.data.success) {
        toast.success('Banner removed');
        fetchBanners();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.banner) {
      toast.error('Please provide title and banner image');
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/banners/${currentId}`, form);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Promotional Banners</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure rotating hero banners and seasonal campaigns shown on the homepage.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Hero Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <LoadingSpinner size="md" text="Loading banners..." />
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-200">
            No promotional banners created yet.
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                <img
                  src={b.banner}
                  alt={b.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {b.badge || 'PROMO'}
                </span>
                <span
                  className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{b.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{b.subtitle}</p>
                  <p className="text-[10px] text-blue-600 font-mono mt-2">Target: {b.link}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(b._id, b.title)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {isEditing ? 'Edit Hero Banner' : 'Create Hero Banner'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Banner Heading *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Autumn & Winter Collection 2026"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Elevate your aesthetic with premium knitwear..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Badge Label</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="e.g. FLASH SALE"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Click Route Link</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder="/products?category=mens-fashion"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700">Banner Image URL or Upload *</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={form.banner}
                    onChange={(e) => setForm({ ...form, banner: e.target.value })}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="https://images.unsplash.com/... or /uploads/..."
                  />
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer flex items-center space-x-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImg ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-bold text-slate-700">Active on Live Homepage</span>
                </label>
              </div>

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
                  {isEditing ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
