import { Product } from "@/types/product";

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
};
