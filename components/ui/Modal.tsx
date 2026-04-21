"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

export function Modal({ open, onClose, title, children, className, centered = true }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className={cn("flex max-h-[90vh] w-full max-w-sm sm:max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,15,20,0.18)]", className)}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-black/10 px-4 py-4 sm:px-6 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title ? <h3 className="text-lg font-semibold tracking-tight">{title}</h3> : null}
                </div>
                <button type="button" onClick={onClose} className="rounded-full border border-black/10 p-2 text-black/60 transition hover:bg-black/5 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6 max-h-[calc(90vh-80px)]">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
