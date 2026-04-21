export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    image: string;
    active: boolean;
  } | null;
  brand: string;
  description: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  stock: number;
  rating: number;
  active: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  image: string;
};

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  brand?: string;
  maxPrice?: number;
  includeInactive?: boolean;
};
