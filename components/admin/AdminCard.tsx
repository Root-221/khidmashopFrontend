import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
};

export function AdminCard({
  children,
  className,
  hover = true,
  interactive = false,
  onClick,
}: AdminCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-black/10 bg-white p-4 sm:p-6 shadow-sm transition-all",
        hover && "hover:shadow-md hover:border-black/20",
        interactive && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
