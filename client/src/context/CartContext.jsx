import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend (if logged in) or read local guest cart
  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        // First check if there's any guest cart to merge
        const guestCartJson = localStorage.getItem('shopez_guest_cart');
        if (guestCartJson) {
          try {
            const guestItems = JSON.parse(guestCartJson);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const mergeRes = await api.post('/cart/items', { guestItems });
              if (mergeRes.data.success) {
                setCart(mergeRes.data.data);
                localStorage.removeItem('shopez_guest_cart');
                return;
              }
            }
          } catch (e) {
            localStorage.removeItem('shopez_guest_cart');
          }
        }

        const res = await api.get('/cart');
        if (res.data.success) {
          setCart(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart from localStorage
      try {
        const guestData = localStorage.getItem('shopez_guest_cart');
        const items = guestData ? JSON.parse(guestData) : [];
        const subtotal = items.reduce((sum, item) => sum + (item.priceSnapshot || 0) * item.quantity, 0);
        const totalDiscount = items.reduce(
          (sum, item) => sum + ((item.priceSnapshot || 0) - (item.finalPriceSnapshot || item.priceSnapshot || 0)) * item.quantity,
          0
        );
        const itemsTotal = subtotal - totalDiscount;
        const shippingFee = itemsTotal >= 999 || itemsTotal === 0 ? 0 : 99; // Free shipping over ₹999
        const taxAmount = Math.round(itemsTotal * 0.05 * 100) / 100;
        const totalAmount = Math.round((itemsTotal + shippingFee + taxAmount) * 100) / 100;

        setCart({
          items,
          totals: {
            subtotal: Math.round(subtotal * 100) / 100,
            discountAmount: Math.round(totalDiscount * 100) / 100,
            itemsTotal: Math.round(itemsTotal * 100) / 100,
            shippingFee,
            taxAmount,
            totalAmount
          },
          itemCount: items.reduce((sum, i) => sum + i.quantity, 0)
        });
      } catch (e) {
        setCart({ items: [], totals: {}, itemCount: 0 });
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = async (product, size, quantity = 1) => {
    const qty = parseInt(quantity, 10) || 1;
    const selectedSize = size || (product.sizes && product.sizes[0]) || 'Standard';

    if (isAuthenticated) {
      try {
        const res = await api.post('/cart/items', {
          productId: product._id,
          size: selectedSize,
          quantity: qty
        });
        if (res.data.success) {
          setCart(res.data.data);
          toast.success(`"${product.title}" added to your bag!`);
        }
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      // Handle guest cart in localStorage
      let guestItems = [];
      try {
        guestItems = JSON.parse(localStorage.getItem('shopez_guest_cart')) || [];
      } catch (e) {
        guestItems = [];
      }

      const existingIndex = guestItems.findIndex(
        (i) => i.productId === product._id && i.size === selectedSize
      );

      const finalPrice = product.finalPrice || (product.price - (product.price * (product.discount || 0)) / 100);

      if (existingIndex > -1) {
        guestItems[existingIndex].quantity = Math.min(
          guestItems[existingIndex].quantity + qty,
          product.stock || 99
        );
      } else {
        guestItems.push({
          _id: 'guest_' + Date.now() + Math.random(),
          productId: product._id,
          titleSnapshot: product.title,
          imageSnapshot: product.mainImg,
          priceSnapshot: product.price,
          discountSnapshot: product.discount || 0,
          finalPriceSnapshot: finalPrice,
          size: selectedSize,
          quantity: Math.min(qty, product.stock || 99)
        });
      }

      localStorage.setItem('shopez_guest_cart', JSON.stringify(guestItems));
      fetchCart();
      toast.success(`"${product.title}" added to your bag!`);
    }
  };

  // Update item
  const updateItem = async (itemId, quantity, size) => {
    if (isAuthenticated) {
      try {
        const res = await api.patch(`/cart/items/${itemId}`, { quantity, size });
        if (res.data.success) {
          setCart(res.data.data);
        }
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      let guestItems = [];
      try {
        guestItems = JSON.parse(localStorage.getItem('shopez_guest_cart')) || [];
      } catch (e) {}

      const idx = guestItems.findIndex((i) => i._id === itemId || i.productId === itemId);
      if (idx > -1) {
        if (quantity !== undefined) {
          if (quantity <= 0) {
            guestItems.splice(idx, 1);
          } else {
            guestItems[idx].quantity = quantity;
          }
        }
        if (size) guestItems[idx].size = size;
        localStorage.setItem('shopez_guest_cart', JSON.stringify(guestItems));
        fetchCart();
      }
    }
  };

  // Remove item
  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/items/${itemId}`);
        if (res.data.success) {
          setCart(res.data.data);
          toast.success('Item removed from cart');
        }
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      let guestItems = [];
      try {
        guestItems = JSON.parse(localStorage.getItem('shopez_guest_cart')) || [];
      } catch (e) {}

      guestItems = guestItems.filter((i) => i._id !== itemId && i.productId !== itemId);
      localStorage.setItem('shopez_guest_cart', JSON.stringify(guestItems));
      fetchCart();
      toast.success('Item removed from cart');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        fetchCart();
      } catch (err) {
        console.error(err);
      }
    } else {
      localStorage.removeItem('shopez_guest_cart');
      fetchCart();
    }
  };

  const itemCount = cart?.itemCount || cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const totals = cart?.totals || {
    subtotal: 0,
    discountAmount: 0,
    itemsTotal: 0,
    shippingFee: 0,
    taxAmount: 0,
    totalAmount: 0
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items || [],
        itemCount,
        totals,
        loading,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
