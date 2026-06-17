import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addToCart,
  changeCartQuantity,
  checkoutCart,
  clearCart,
  fetchCart,
  removeCartItem,
} from '../api/cart.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const EMPTY_CART = { id: null, items: [], count: 0, subtotal: 0, currency: 'USD' };

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return undefined;
    }

    const controller = new AbortController();

    fetchCart(controller.signal)
      .then(setCart)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Unable to load cart:', error);
        }
      });

    return () => controller.abort();
  }, [isAuthenticated]);

  const run = useCallback(async (action) => {
    setIsUpdating(true);
    try {
      const next = await action();
      setCart(next);
      return next;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const addItem = useCallback(
    ({ variant, quantity = 1 }) =>
      run(() => addToCart({ variantId: variant.id, quantity })),
    [run],
  );

  const setQuantity = useCallback(
    (variantId, quantity) => run(() => changeCartQuantity({ variantId, quantity })),
    [run],
  );

  const removeItem = useCallback(
    (variantId) => run(() => removeCartItem({ variantId })),
    [run],
  );

  const emptyCart = useCallback(() => run(() => clearCart()), [run]);

  const checkout = useCallback(async (address) => {
    const result = await checkoutCart(address);
    // Fourthwall returns a hosted checkout URL; the order is only received once
    // the customer completes payment there, so we must redirect to it.
    const url =
      result?.checkout_url ||
      result?.order?.checkout_url ||
      result?.checkoutUrl ||
      result?.url;
    if (url) {
      window.location.href = url;
    }
    return result;
  }, []);

  const value = useMemo(
    () => ({
      cart,
      isUpdating,
      addItem,
      setQuantity,
      removeItem,
      emptyCart,
      checkout,
    }),
    [cart, isUpdating, addItem, setQuantity, removeItem, emptyCart, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
