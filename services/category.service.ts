import { request } from '@/services/api.client';
import { Category } from '@/types/product';

type CreateCategoryPayload = {
  name: string;
  slug?: string;
  image?: string;
  active?: boolean;
};

type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export async function listCategories(options?: { includeInactive?: boolean }) {
  return request<Category[]>('/categories', {
    params: options?.includeInactive ? { includeInactive: true } : undefined,
  });
}

export async function createCategory(payload: CreateCategoryPayload) {
  return request<Category>('/categories', {
    method: 'POST',
    body: payload,
  });
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload) {
  return request<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export async function toggleCategoryActive(id: string, active: boolean) {
  return request<Category>(`/categories/${id}/toggle`, {
    method: 'PATCH',
    body: { active },
  });
}

export async function deleteCategory(id: string) {
  return request<{ message: string }>(`/categories/${id}`, {
    method: 'DELETE',
  });
}
