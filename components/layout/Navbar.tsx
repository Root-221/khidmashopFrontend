"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, LogOut, LogIn } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useUiStore } from "@/stores/useUiStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/utils/cn";
import { LoginModal } from "@/components/auth/LoginModal";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import { PINSetupModal } from "@/components/auth/PINSetupModal";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Catalogue" },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { openCartDrawer, openLoginModal, openLogoutConfirmModal } = useUiStore();
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
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
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="rounded-full px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <button 
                onClick={openLoginModal}
                className="hidden md:flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 hover:text-black"
              >
                <LogIn className="h-4 w-4" />
                <span>Connexion</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-3 mr-2 px-3 py-1.5 rounded-full bg-black/5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white uppercase">
                    {user.name.slice(0, 1)}
                  </div>
                  <span className="text-xs font-semibold max-w-[80px] truncate">{user.name}</span>
                </div>
                <button 
                  onClick={openLogoutConfirmModal}
                  className="rounded-full p-1.5 text-black/40 transition hover:bg-red-50 hover:text-red-600"
                  title="Déconnexion"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

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

      {/* Auth Modals */}
      <LoginModal />
      <LogoutConfirmModal />
      <PINSetupModal />
    </>
  );
}
