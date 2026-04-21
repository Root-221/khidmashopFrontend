import { useAuthStore } from '@/stores/useAuthStore';
import { request } from '@/services/api.client';
import { AuthRole, AuthUser, OtpSendPayload, OtpVerifyPayload } from '@/types/auth';
import { getUserProfile } from '@/services/user.service';

type TokenResponse = {
  accessToken: string;
  role: AuthRole;
};

export async function sendOtp(payload: OtpSendPayload) {
  return request('/auth/send-otp', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export async function verifyOtp(payload: OtpVerifyPayload): Promise<TokenResponse> {
  const data = await request<TokenResponse>('/auth/verify-otp', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });

  useAuthStore.getState().setToken(data.accessToken);
  useAuthStore.getState().setUser({ id: '', name: 'Client', phone: '', role: data.role });
  await loadUserProfile();
  return data;
}

export async function adminLogin(payload: { email: string; password: string }): Promise<TokenResponse> {
  const data = await request<TokenResponse>('/auth/admin-login', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });

  useAuthStore.getState().setToken(data.accessToken);
  useAuthStore.getState().setUser({ id: '', name: 'Admin', phone: '', email: '', role: data.role });
  await loadUserProfile();
  return data;
}

export async function logout() {
  try {
    await request('/auth/logout', {
      method: 'POST',
    });
  } finally {
    useAuthStore.getState().clearSession();
  }
}

export async function loadUserProfile(): Promise<AuthUser | null> {
  try {
    const user = await getUserProfile();
    useAuthStore.getState().setUser(user);
    return user;
  } catch (error) {
    useAuthStore.getState().setUser(null);
    return null;
  }
}
