import { request } from '@/services/api.client';
import { User } from '@/types/user';

export async function listUsers() {
  return request<User[]>('/users');
}

export async function getUserById(id: string) {
  return request<User>(`/users/${id}`);
}

export async function createUser(payload: Partial<User>) {
  return request<User>('/users', {
    method: 'POST',
    body: payload,
  });
}

export async function updateUser(id: string, payload: Partial<User>) {
  return request<User>(`/users/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export async function deleteUser(id: string) {
  return request<{ message: string }>(`/users/${id}`, {
    method: 'DELETE',
  });
}

export async function listUserStats() {
  return request<{ total: number; admins: number; clients: number }>('/users/stats');
}

export async function getUserProfile() {
  return request<User>('/users/me');
}
