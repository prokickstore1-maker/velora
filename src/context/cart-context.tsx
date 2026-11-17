"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface CartItem {
  productId: number;
  productSlug: string;
  productName: string;
  versionId: number;
  versionName: string;
  priceRm: string;
  quantity: number;
  imageUrl: string;
  maxStock: number;
  sku: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (versionId: number) => void;
  updateQuantity: (versionId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCount: number;
  subtotalRm: number;
  subtotalFormatted: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "myvelora_cart_items_v1";

function getInitialCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load cart from localStorage", e);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialCartItems);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addItem = (newItem: Omit<CartItem, "quantity">, quantityToAdd = 1) => {
    if (newItem.maxStock <= 0) {
      toast.error("Sold out");
      return;
    }

    const existing = items.find((i) => i.versionId === newItem.versionId);
    if (existing && existing.quantity + quantityToAdd > newItem.maxStock) {
      toast.warning(`Only ${newItem.maxStock} left in stock`);
    }

    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (i) => i.versionId === newItem.versionId
      );

      if (existingIndex > -1) {
        const current = currentItems[existingIndex];
        const newQty = Math.min(current.quantity + quantityToAdd, newItem.maxStock);
        const updated = [...currentItems];
        updated[existingIndex] = { ...current, quantity: newQty };
        return updated;
      }

      const initialQty = Math.min(quantityToAdd, newItem.maxStock);
      return [...currentItems, { ...newItem, quantity: initialQty }];
    });

    setIsCartOpen(true);
  };

  const removeItem = (versionId: number) => {
    setItems((currentItems) => currentItems.filter((i) => i.versionId !== versionId));
  };

  const updateQuantity = (versionId: number, targetQty: number) => {
    if (targetQty <= 0) {
      removeItem(versionId);
      return;
    }

    const targetItem = items.find((i) => i.versionId === versionId);
    if (targetItem && targetQty > targetItem.maxStock) {
      toast.warning(`Only ${targetItem.maxStock} left in stock`);
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.versionId === versionId) {
          return { ...item, quantity: Math.min(targetQty, item.maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotalRm = items.reduce((acc, item) => {
    const price = parseFloat(item.priceRm) || 0;
    return acc + price * item.quantity;
  }, 0);

  const subtotalFormatted = `RM ${subtotalRm.toFixed(2)}`;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalCount,
        subtotalRm,
        subtotalFormatted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
