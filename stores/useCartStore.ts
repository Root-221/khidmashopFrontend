import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getSafeStorage } from "@/utils/storage";

type CartState = {
  items: CartItem[];
  addItem: (product: Product, options?: { quantity?: number; size?: string; color?: string }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, options) =>
        set((state) => {
          const quantity = options?.quantity ?? 1;
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.size === options?.size && item.color === options?.color,
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                id: `${product.id}-${options?.size ?? "u"}-${options?.color ?? "u"}-${Date.now()}`,
                product,
                quantity,
                size: options?.size,
                color: options?.color,
              },
            ],
          };
        }),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item)),
        })),
      removeItem: (itemId) => set((state) => ({ items: state.items.filter((item) => item.id !== itemId) })),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: "khidma-cart",
      storage: createJSONStorage(() => getSafeStorage()),
    },
  ),
);
