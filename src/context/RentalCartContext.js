'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../lib/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useDiscount } from './DiscountContext';

const RentalCartContext = createContext(null);

export const RentalCartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [eventDate, setEventDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [rentalMode, setRentalMode] = useState('DAILY'); // 'DAILY' or 'HOURLY'
  const [rentalHours, setRentalHours] = useState(4); // default 4 hours if hourly
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const { user } = useAuth();
  const { effectiveDiscount } = useDiscount();

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lumiere_rental_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
      const savedEvent = localStorage.getItem('lumiere_rental_event_date');
      const savedReturn = localStorage.getItem('lumiere_rental_return_date');
      const savedMode = localStorage.getItem('lumiere_rental_mode');
      const savedHours = localStorage.getItem('lumiere_rental_hours');

      if (savedEvent) setEventDate(savedEvent);
      if (savedReturn) setReturnDate(savedReturn);
      if (savedMode) setRentalMode(savedMode);
      if (savedHours) setRentalHours(Number(savedHours) || 4);
    } catch (e) {
      console.warn('Failed to parse cart storage', e);
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lumiere_rental_cart', JSON.stringify(cartItems));
      if (eventDate) localStorage.setItem('lumiere_rental_event_date', eventDate);
      if (returnDate) localStorage.setItem('lumiere_rental_return_date', returnDate);
      localStorage.setItem('lumiere_rental_mode', rentalMode);
      localStorage.setItem('lumiere_rental_hours', String(rentalHours));
    } catch (e) {
      console.warn('Failed to sync cart storage', e);
    }
  }, [cartItems, eventDate, returnDate, rentalMode, rentalHours]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const isDateRangeValid = useMemo(() => {
    if (!eventDate || !returnDate) return false;
    if (eventDate < todayStr) return false;
    if (returnDate < eventDate) return false;
    return true;
  }, [eventDate, returnDate, todayStr]);

  const dateError = useMemo(() => {
    if (!eventDate) return 'Please select event start date';
    if (!returnDate) return 'Please select return date';
    if (eventDate < todayStr) return 'Event start date cannot be in the past';
    if (returnDate < eventDate) return 'Return date cannot be earlier than event start date';
    return null;
  }, [eventDate, returnDate, todayStr]);

  const daysCount = useMemo(() => {
    if (!eventDate || !returnDate) return 1;
    if (returnDate < eventDate) return 1;
    const start = new Date(eventDate + 'T00:00:00');
    const end = new Date(returnDate + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [eventDate, returnDate]);

  const handleSetEventDate = (date) => {
    setEventDate(date);
    if (date && returnDate && returnDate < date) {
      setReturnDate(date);
    }
  };

  const handleSetReturnDate = (date) => {
    if (date && eventDate && date < eventDate) {
      showToast('Return date cannot be earlier than event start date', 'error');
      setReturnDate(eventDate);
      return;
    }
    setReturnDate(date);
  };

  // Calculate unit rate for an item depending on DAILY vs HOURLY mode
  const calculateItemUnitRate = (item) => {
    const isHourly = (item.durationMode || rentalMode) === 'HOURLY';
    if (isHourly) {
      const rate = item.hourlyRate > 0 ? item.hourlyRate : +(item.rentalPrice * 0.2).toFixed(2);
      const hours = item.durationHours || rentalHours || 4;
      return +(rate * hours).toFixed(2);
    } else {
      const days = daysCount || 1;
      return +(item.rentalPrice * days).toFixed(2);
    }
  };

  const rawSubtotal = useMemo(() => {
    const total = cartItems.reduce((sum, item) => {
      const unitRate = calculateItemUnitRate(item);
      return sum + unitRate * item.quantity;
    }, 0);
    return +total.toFixed(2);
  }, [cartItems, rentalMode, rentalHours, daysCount]);

  const discountSavings = useMemo(() => {
    if (effectiveDiscount <= 0) return 0;
    return +((rawSubtotal * effectiveDiscount) / 100).toFixed(2);
  }, [rawSubtotal, effectiveDiscount]);

  const subtotal = useMemo(() => {
    return Math.max(0, +(rawSubtotal - discountSavings).toFixed(2));
  }, [rawSubtotal, discountSavings]);

  const totalDeposit = useMemo(() => {
    const deposit = cartItems.reduce(
      (sum, item) => sum + ((item.depositAmount !== null && item.depositAmount !== undefined) ? item.depositAmount : +(item.rentalPrice * 0.3).toFixed(2)) * item.quantity,
      0
    );
    return +deposit.toFixed(2);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    return +(subtotal + totalDeposit).toFixed(2);
  }, [subtotal, totalDeposit]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const addToCart = (item, quantity = 1, itemRentalMode = rentalMode, itemHours = rentalHours) => {
    const qty = Math.max(1, Number(quantity));

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id && (i.durationMode || rentalMode) === itemRentalMode);
      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + qty;

        if (newQty > item.availableQuantity) {
          showToast(`Cannot add more. Only ${item.availableQuantity} available in inventory.`, 'error');
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        showToast(`Updated "${item.name}" quantity to ${newQty}`, 'success');
        return updated;
      } else {
        if (qty > item.availableQuantity) {
          showToast(`Only ${item.availableQuantity} units available for "${item.name}".`, 'error');
          return prev;
        }
        showToast(`Added "${item.name}" (${itemRentalMode === 'HOURLY' ? `${itemHours} hrs` : 'Daily'}) to cart`, 'success');
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            category: item.category,
            rentalPrice: item.rentalPrice,
            hourlyRate: item.hourlyRate || +(item.rentalPrice * 0.2).toFixed(2),
            depositAmount: item.depositAmount,
            imageUrl: item.imageUrl,
            availableQuantity: item.availableQuantity,
            quantity: qty,
            durationMode: itemRentalMode,
            durationHours: itemHours,
          },
        ];
      }
    });
  };

  const updateItemDurationMode = (itemId, newMode, newHours = rentalHours) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            durationMode: newMode,
            durationHours: newMode === 'HOURLY' ? newHours : undefined,
          };
        }
        return item;
      })
    );
  };

  const updateQuantity = (itemId, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (qty > item.availableQuantity) {
            showToast(`Maximum available quantity is ${item.availableQuantity}`, 'error');
            return { ...item, quantity: item.availableQuantity };
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setEventDate('');
    setReturnDate('');
    setRentalMode('DAILY');
    setRentalHours(4);
    try {
      localStorage.removeItem('lumiere_rental_cart');
      localStorage.removeItem('lumiere_rental_event_date');
      localStorage.removeItem('lumiere_rental_return_date');
      localStorage.removeItem('lumiere_rental_mode');
      localStorage.removeItem('lumiere_rental_hours');
    } catch (e) {
      console.warn('Failed to clear cart storage', e);
    }
  };

  const submitRentalOrder = async (customerData) => {
    if (cartItems.length === 0) {
      showToast('Your rental cart is empty', 'error');
      return;
    }

    if (!eventDate || !returnDate) {
      showToast('Please select both Event Date and Return Date', 'error');
      return;
    }

    if (eventDate < todayStr) {
      showToast('Event start date cannot be in the past', 'error');
      return;
    }

    if (returnDate < eventDate) {
      showToast('Return date cannot be earlier than event start date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerData.name || user?.name || 'Valued Client',
        customerEmail: customerData.email || user?.email,
        customerPhone: customerData.phone || user?.phone,
        eventDate,
        returnDate,
        rentalMode,
        rentalHours: rentalMode === 'HOURLY' ? rentalHours : 24,
        discount: discountSavings,
        items: cartItems.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
        })),
        notes: [
          customerData.location ? `Venue / Delivery Address: ${customerData.location}` : '',
          customerData.notes ? `Delivery Notes: ${customerData.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n') || null,
      };

      const res = await api.submitRentalRequest(payload);
      showToast(`Rental Request #${res.rentalRequest.rentalNumber} submitted successfully!`, 'success');
      clearCart();
      setIsCartOpen(false);

      // Immediately broadcast event so all components update inventory in real-time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('inventory_updated', { detail: { order: res.rentalRequest } }));
      }

      return res.rentalRequest;
    } catch (error) {
      const msg = error.data?.message || error.message || 'Failed to submit rental request';
      showToast(msg, 'error');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RentalCartContext.Provider
      value={{
        cartItems,
        eventDate,
        setEventDate: handleSetEventDate,
        returnDate,
        setReturnDate: handleSetReturnDate,
        isDateRangeValid,
        dateError,
        rentalMode,
        setRentalMode,
        rentalHours,
        setRentalHours,
        daysCount,
        rawSubtotal,
        discountSavings,
        effectiveDiscount,
        subtotal,
        totalDeposit,
        totalAmount,
        totalItemsCount,
        calculateItemUnitRate,
        addToCart,
        updateItemDurationMode,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        submitRentalOrder,
        submitting,
      }}
    >
      {children}
    </RentalCartContext.Provider>
  );
};

export const useRentalCart = () => {
  const context = useContext(RentalCartContext);
  if (!context) {
    throw new Error('useRentalCart must be used within a RentalCartProvider');
  }
  return context;
};
