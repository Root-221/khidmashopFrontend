"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, History } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCartStore } from "@/stores/useCartStore";
import { useUiStore } from "@/stores/useUiStore";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Cat.", icon: LayoutGrid },
  { href: "/orders", label: "Commandes", icon: History },
  { href: "/cart", label: "Panier", icon: ShoppingBag, isCart: true },
];

export function MobileNavbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const openCartDrawer = useUiStore((state) => state.openCartDrawer);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isCart = 'isCart' in item && item.isCart;

          if (isCart) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={openCartDrawer}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] text-black/55",
                  isActive && "bg-black text-white",
                )}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {itemCount > 0 ? (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                      {itemCount}
                    </span>
                  ) : null}
                </div>
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] text-black/55",
                isActive && "bg-black text-white",
              )}
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
