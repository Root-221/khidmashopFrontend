import { AuthRole } from "@/types/auth";

export type User = {
  id: string;
  name: string;
  phone: string;
  role: AuthRole;
  address?: string;
  avatar?: string;
  createdAt: string;
};
