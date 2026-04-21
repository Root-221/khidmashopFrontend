import { request } from '@/services/api.client';
import { Product, ProductFilters } from '@/types/product';

export async function listProducts(filters?: ProductFilters) {
  const data = await request<Product[]>('/products', {
    params: filters,
  });
  return data.map(normalizeProduct);
}

export async function getProductById(id: string) {
  const product = await request<Product>(`/products/${id}`);
  return normalizeProduct(product);
}

export async function listFeaturedProducts() {
  const data = await request<Product[]>('/products/featured');
  return data.map(normalizeProduct);
}

type ProductImageItem = {
  preview: string;
  file?: File;
};

type ProductPayload = {
  name?: string;
  slug?: string;
  price?: number;
  images?: string[];
  existingImages?: string[];
  categoryId?: string;
  brand?: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  rating?: number;
  featured?: boolean;
  active?: boolean;
};

type ProductRequestPayload = ProductPayload | FormData;

export async function createProduct(payload: ProductRequestPayload, images?: ProductImageItem[]) {
  let finalPayload: ProductRequestPayload = payload;
  
  if (images && images.length > 0) {
    const formData = new FormData();
    const payloadObj = payload as ProductPayload;
    
    Object.entries(payloadObj).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    images.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file);
      }
    });
    
    finalPayload = formData;
  }

  const product = await request<Product>('/products', {
    method: 'POST',
    body: finalPayload,
  });
  return normalizeProduct(product);
}

export async function updateProduct(id: string, payload: ProductRequestPayload, images?: ProductImageItem[]) {
  let finalPayload: ProductRequestPayload = payload;
  
  if (images && images.length > 0) {
    const formData = new FormData();
    const payloadObj = payload as ProductPayload;
    
    Object.entries(payloadObj).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    images.forEach((img) => {
      if (img.file) {
        formData.append('images', img.file);
      }
    });
    
    finalPayload = formData;
  }

  const product = await request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: finalPayload,
  });
  return normalizeProduct(product);
}

export async function toggleProductActive(id: string, active: boolean) {
  const product = await request<Product>(`/products/${id}/toggle`, {
    method: 'PATCH',
    body: { active },
  });
  return normalizeProduct(product);
}

export async function deleteProduct(id: string) {
  return request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function listProductBrands() {
  return request<string[]>('/products/brands');
}

export async function listProductStats() {
  return request<{
    total: number;
    featured: number;
    categories: number;
  }>('/products/stats');
}

function normalizeProduct(product: Product) {
  return {
    ...product,
    categoryName: product.category?.name ?? "",
  };
}
