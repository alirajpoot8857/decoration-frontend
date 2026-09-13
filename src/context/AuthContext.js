'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('lumiere_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('lumiere_token');
      }
    } catch (err) {
      console.warn('Authentication check failed:', err);
      localStorage.removeItem('lumiere_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.token) {
        localStorage.setItem('lumiere_token', res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}`, 'success');
        return res.user;
      }
    } catch (error) {
      const msg = error.data?.message || error.message || 'Login failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.token) {
        localStorage.setItem('lumiere_token', res.token);
        setUser(res.user);
        showToast(`Account created successfully! Welcome to Lumière Decor, ${res.user.name}`, 'success');
        return res.user;
      }
    } catch (error) {
      const msg = error.data?.message || error.message || 'Registration failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('lumiere_token');
    setUser(null);
    showToast('You have been logged out', 'info');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.user) {
        setUser(res.user);
        showToast('Profile updated successfully', 'success');
      }
      return res;
    } catch (error) {
      const msg = error.data?.message || error.message || 'Profile update failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';
  const isStaffOrAdmin = isAdmin || isStaff;
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isStaff,
        isStaffOrAdmin,
        isCustomer,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
