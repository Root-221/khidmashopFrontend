import { ToastMessage } from "@/types/ui";
import { create } from "zustand";

type UiState = {
  cartDrawerOpen: boolean;
  loginModalOpen: boolean;
  logoutConfirmModalOpen: boolean;
  pinSetupModalOpen: boolean;
  pinSetupPhone: string | null;
  toasts: ToastMessage[];
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openLogoutConfirmModal: () => void;
  closeLogoutConfirmModal: () => void;
  openPinSetupModal: (phone: string) => void;
  closePinSetupModal: () => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  cartDrawerOpen: false,
  loginModalOpen: false,
  logoutConfirmModalOpen: false,
  pinSetupModalOpen: false,
  pinSetupPhone: null,
  toasts: [],
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openLogoutConfirmModal: () => set({ logoutConfirmModalOpen: true }),
  closeLogoutConfirmModal: () => set({ logoutConfirmModalOpen: false }),
  openPinSetupModal: (phone) => set({ pinSetupModalOpen: true, pinSetupPhone: phone }),
  closePinSetupModal: () => set({ pinSetupModalOpen: false, pinSetupPhone: null }),
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
