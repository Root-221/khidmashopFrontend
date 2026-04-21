export type ToastVariant = "default" | "success" | "error";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};
