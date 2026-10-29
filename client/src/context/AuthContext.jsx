import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on load
  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('shopez_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Login handler
  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', {
        loginId: identifier,
        password
      });

      if (res.data.success) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('shopez_token', res.data.token);
        }
        toast.success(res.data.message || 'Logged in successfully!');
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('shopez_token', res.data.token);
        }
        toast.success('Registration successful! Welcome to SHOPEZ.');
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue even if server logout errored
    } finally {
      setUser(null);
      localStorage.removeItem('shopez_token');
      toast.success('You have been logged out.');
    }
  };

  // Profile update handler
  const updateProfile = async (formData) => {
    try {
      const res = await api.patch('/auth/profile', formData);
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile updated successfully!');
        return res.data.data;
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.userType === 'admin',
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
