import { request } from '@/services/api.client';
import { CartItem } from '@/types/cart';
import { Order } from '@/types/order';

export async function listOrders() {
  return request<Order[]>('/orders');
}

export async function getOrderById(id: string) {
  return request<Order>(`/orders/${id}`, { skipAuth: true });
}

export async function searchOrdersByPhone(phone: string) {
  return request<Order[]>('/orders/search', {
    method: 'POST',
    body: { phone },
    skipAuth: true,
  });
}

export async function createOrder(payload: {
  customerName: string;
  phone: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  items: CartItem[];
}) {
  const items = payload.items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
  }));

  return request<Order>('/orders', {
    method: 'POST',
    body: { ...payload, items },
  });
}

export async function cancelOrder(id: string, phone: string) {
  return request<Order>(`/orders/${id}/cancel`, {
    method: 'PATCH',
    body: { phone },
    skipAuth: true,
  });
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  return request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function listOrderStats() {
  return request<{
    total: number;
    pending: number;
    confirmed: number;
    delivered: number;
  }>('/orders/stats');
}
