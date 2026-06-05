import axios from 'axios';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import type { Cart, CartItem } from '../types/cart';
import type { Order } from '../types/order';

type CheckoutInput = {
  addressId?: string;
  notes?: string;
  deliveryFee?: number;
  tax?: number;
};

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  loading: boolean;
  addItem: (menuItemId: string, quantity?: number) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  removeItem: (menuItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  checkout: (input?: CheckoutInput) => Promise<Order>;
};

type CartResponse = {
  cart: Cart;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  itemCount: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!user) {
      setCart(emptyCart);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.get<CartResponse>('/cart');
      setCart(data.cart);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const mutateAndRefresh = async <T,>(request: Promise<T>) => {
    await request;
    await loadCart();
  };

  const addItem = async (menuItemId: string, quantity = 1) => {
    if (!user) {
      throw new Error('Please log in to add items to your cart');
    }

    try {
      await mutateAndRefresh(api.post<CartResponse>('/cart/items', { menuItemId, quantity }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? 'Unable to add item');
      }

      throw new Error('Unable to add item');
    }
  };

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    if (!user) {
      throw new Error('Please log in to update your cart');
    }

    try {
      await mutateAndRefresh(api.patch<CartResponse>(`/cart/items/${menuItemId}`, { quantity }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? 'Unable to update item');
      }

      throw new Error('Unable to update item');
    }
  };

  const removeItem = async (menuItemId: string) => {
    if (!user) {
      throw new Error('Please log in to update your cart');
    }

    try {
      await mutateAndRefresh(api.delete<CartResponse>(`/cart/items/${menuItemId}`));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? 'Unable to remove item');
      }

      throw new Error('Unable to remove item');
    }
  };

  const clearCart = async () => {
    if (!user) {
      return;
    }

    await mutateAndRefresh(api.delete('/cart/clear'));
  };

  const checkout = async (input?: CheckoutInput) => {
    if (!user) {
      throw new Error('Please log in to place an order');
    }

    if (cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    const { data } = await api.post<{ order: Order }>('/orders', {
      addressId: input?.addressId,
      notes: input?.notes,
      deliveryFee: input?.deliveryFee ?? 0,
      tax: input?.tax ?? 0,
      items: cart.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
    });

    await loadCart();
    return data.order;
  };

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.itemCount,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: loadCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return value;
}
