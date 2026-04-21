"use client";

import toast from "react-hot-toast";

export function useToast() {
  const formatMessage = (title: string, description?: string) =>
    description ? `${title} — ${description}` : title;

  return {
    success(title: string, description?: string) {
      toast.success(formatMessage(title, description));
    },
    error(title: string, description?: string) {
      toast.error(formatMessage(title, description));
    },
    info(title: string, description?: string) {
      toast(formatMessage(title, description), { icon: "ℹ️" });
    },
  };
}
