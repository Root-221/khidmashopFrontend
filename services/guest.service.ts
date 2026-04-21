import { request } from '@/services/api.client';
import { Order } from '@/types/order';

export async function checkPhoneExists(phone: string) {
  return request<{ exists: boolean; user?: { id: string; name: string; address?: string } }>('/orders/check-phone', {
    method: 'POST',
    body: { phone },
    skipAuth: true,
  });
}

export async function createGuestOrder(payload: {
  phone: string;
  customerName?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  items: { productId: string; quantity: number; size?: string; color?: string }[];
}): Promise<Order> {
  return request<Order>('/orders/guest', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}