import { ToastMessage } from "@/types/ui";
import { create } from "zustand";

type UiState = {
  cartDrawerOpen: boolean;
  toasts: ToastMessage[];
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  cartDrawerOpen: false,
  toasts: [],
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  pushToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 3200);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));
