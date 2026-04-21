import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type AdminButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary:
    "bg-black text-white border border-black hover:bg-black/90",
  secondary:
    "bg-white text-black border border-black/10 hover:bg-black/5",
  danger: "bg-black text-white border border-black/70 hover:bg-black/90",
  ghost: "bg-transparent text-black hover:bg-black/5",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  className,
  onClick,
  type = "button",
}: AdminButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
