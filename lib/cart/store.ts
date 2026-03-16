// lib/cart/store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id:           string;
  sku:          string;
  name:         string;
  brand:        string;
  priceUsd:     number;   // cents
  priceUsdc:    number;
  highTicket:   boolean;
  imageSlug:    string;
  qty:          number;
  stripePriceId?: string;
}

interface CartStore {
  items:      CartItem[];
  open:       boolean;
  addItem:    (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty:  (id: string, qty: number) => void;
  clearCart:  () => void;
  setOpen:    (open: boolean) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      open:  false,

      addItem(item) {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, { ...item, qty: 1 }] }));
        }
      },

      removeItem(id) {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      },

      updateQty(id, qty) {
        if (qty < 1) {
          set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
        } else {
          set((s) => ({
            items: s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
          }));
        }
      },

      clearCart() {
        set({ items: [] });
      },

      setOpen(open) {
        set({ open });
      },
    }),
    { name: "tevatha-cart" }
  )
);

export function cartTotal(items: CartItem[]): number {
  return items
    .filter((i) => !i.highTicket)
    .reduce((sum, i) => sum + i.priceUsd * i.qty, 0);
}

export function cartTotalUsdc(items: CartItem[]): number {
  return items
    .filter((i) => i.highTicket)
    .reduce((sum, i) => sum + i.priceUsdc * i.qty, 0);
}
