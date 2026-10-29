import React, { useState } from 'react';
import { User, Lock, MapPin, Package, ShieldCheck, Check, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  // Profile fields state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    address: user?.address || '',
    pincode: user?.pincode || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password fields state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passSaving, setPassSaving] = useState(false);

  // Address modal state
  const [savedAddresses, setSavedAddresses] = useState(user?.savedAddresses || []);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [showAddrForm, setShowAddrForm] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await updateProfile({
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        pincode: formData.pincode,
        savedAddresses
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setPassSaving(true);
      const res = await api.patch('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPassSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.street || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    const updated = [
      ...savedAddresses,
      { ...newAddr, isDefault: savedAddresses.length === 0 }
    ];
    setSavedAddresses(updated);
    await updateProfile({ savedAddresses: updated });
    setNewAddr({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
    setShowAddrForm(false);
  };

  const handleDeleteAddress = async (index) => {
    const updated = savedAddresses.filter((_, i) => i !== index);
    setSavedAddresses(updated);
    await updateProfile({ savedAddresses: updated });
    toast.success('Address removed');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, saved shipping addresses, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Profile Form */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-slate-900 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold">Personal Information</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address (Read-Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Default Street Address</label>
              <input
                type="text"
                placeholder="Street name and number"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Pincode / ZIP</label>
              <input
                type="text"
                placeholder="e.g. 10001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-slate-900 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">New Password (Min. 6 characters)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={passSaving}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {passSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3 text-slate-900">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold">Saved Shipping Addresses</h2>
          </div>
          <button
            onClick={() => setShowAddrForm(!showAddrForm)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedAddresses.map((addr, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Default
                    </span>
                  )}
                </div>
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                <p className="font-medium text-slate-700">Phone: {addr.phone}</p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleDeleteAddress(idx)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Address Form Modal / Inline */}
        {showAddrForm && (
          <form
            onSubmit={handleAddAddress}
            className="p-5 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-4"
          >
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              New Shipping Destination
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={newAddr.fullName}
                onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Street Address"
                required
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-xl sm:col-span-2"
              />
              <input
                type="text"
                placeholder="City"
                required
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="State"
                required
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Pincode / ZIP"
                required
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                className="p-2.5 bg-white border border-slate-200 rounded-xl sm:col-span-2"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddrForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Save Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
