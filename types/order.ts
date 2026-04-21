export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export type OrderItem = {
  id: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
  productSnapshot: {
    name: string;
    price: number;
    image?: string | null;
    brand?: string | null;
  };
};

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  total: number;
};
