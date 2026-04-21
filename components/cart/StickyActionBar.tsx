"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type StickyActionBarProps = {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
};

export function StickyActionBar({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  className,
  children,
  disabled,
}: StickyActionBarProps) {
  return (
    <div className={cn("fixed inset-x-0 bottom-20 z-50 border-t border-black/10 bg-white p-3 md:bottom-0", className)}>
      <div className="container-safe flex flex-col gap-3 sm:flex-row sm:items-center">
        {children ? <div className="min-w-0 flex-1">{children}</div> : null}
        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            className="btn-base w-full border border-black/10 bg-white px-4 py-3 sm:w-auto"
          >
            {secondaryLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onPrimary}
          disabled={disabled}
          className="btn-base w-full bg-black px-5 py-3 text-white sm:w-auto"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
