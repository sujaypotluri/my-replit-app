import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PortalOrderItemBillingCycle } from "@workspace/api-client-react";

export interface CartItem {
  productId: number;
  productName: string;
  tierId: number;
  tierName: string;
  seats: number;
  pricePerSeat: number;
  billingCycle: PortalOrderItemBillingCycle;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateSeats: (productId: number, tierId: number, seats: number) => void;
  removeItem: (productId: number, tierId: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("neurallaunch_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse cart", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("neurallaunch_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.findIndex(
        (i) => i.productId === newItem.productId && i.tierId === newItem.tierId && i.billingCycle === newItem.billingCycle
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], seats: updated[existing].seats + newItem.seats };
        return updated;
      }
      return [...prev, newItem];
    });
  }, []);

  const updateSeats = useCallback((productId: number, tierId: number, seats: number) => {
    if (seats <= 0) return;
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.tierId === tierId ? { ...i, seats } : i
      )
    );
  }, []);

  const removeItem = useCallback((productId: number, tierId: number) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.tierId === tierId)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartTotal = items.reduce((acc, item) => {
    const cycleMultiplier = item.billingCycle === "annual" ? 12 : 1;
    return acc + item.pricePerSeat * item.seats * cycleMultiplier;
  }, 0);

  const cartCount = items.reduce((acc, item) => acc + item.seats, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateSeats, removeItem, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
