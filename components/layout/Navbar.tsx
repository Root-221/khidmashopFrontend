"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useUiStore } from "@/stores/useUiStore";
import { cn } from "@/utils/cn";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Catalogue" },
];

export function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const openCartDrawer = useUiStore((state) => state.openCartDrawer);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="container-safe flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black bg-black text-sm font-semibold text-white">
            K
          </span>
          <span className="text-sm font-semibold tracking-[0.24em]">KHIDMA SHOP</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-black",
                pathname === link.href && "bg-black text-white hover:bg-black",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/orders"
            className={cn(
              "rounded-full px-4 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-black",
              pathname === "/orders" && "bg-black text-white hover:bg-black",
            )}
          >
            Commandes
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={openCartDrawer} className="btn-base border border-black/10 bg-white px-3 py-2 text-sm">
            <span className="relative mr-2">
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                  {itemCount}
                </span>
              ) : null}
            </span>
            <span>Panier</span>
          </button>
        </div>
      </div>
    </header>
  );
}
