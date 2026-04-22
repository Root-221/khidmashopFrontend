import { AuthUser } from '@/types/auth';
import { create } from 'zustand';
import { decodeJwt } from '@/utils/jwt';

const getExpirationFromToken = (token: string | null) => {
  if (!token) return null;
  const payload = decodeJwt<{ exp?: number }>(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  accessTokenExpiresAt: number | null;
  isHydrated: boolean;
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  accessTokenExpiresAt: null,
  isHydrated: false,
  isInitialized: false,
  setInitialized: (value) => set({ isInitialized: value }),
  setHydrated: (value) => set({ isHydrated: value }),
  setToken: (token) => {
    set({
      token,
      accessTokenExpiresAt: getExpirationFromToken(token),
    });
  },
  setUser: (user) => set({ user }),
  clearSession: () => set({ user: null, token: null, accessTokenExpiresAt: null, isInitialized: false }),
}));
