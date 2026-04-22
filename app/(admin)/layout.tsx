"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Modal } from "@/components/ui/Modal";
import { logout as endSession, loadUserProfile } from "@/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader } from "@/components/ui/Loader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const { user, isInitialized, setInitialized, clearSession } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!isInitialized && !isLoginPage) {
        try {
          await loadUserProfile();
        } catch (error) {
          console.error("Auth initialization failed", error);
        } finally {
          setInitialized(true);
        }
      } else if (isLoginPage) {
        setInitialized(true);
      }
    };

    initAuth();
  }, [isInitialized, isLoginPage, setInitialized]);

  useEffect(() => {
    setMobileNavOpen(false);
    
    // Safety check: if we're initialized, not on login page, and still no user, redirect to home
    if (isInitialized && !isLoginPage && !user) {
      router.replace("/");
    }
  }, [pathname, isLoginPage, router, isInitialized, user]);

  const handleLogout = async () => {
    try {
      await endSession();
    } finally {
      clearSession();
      router.replace("/");
      setShowLogoutConfirm(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-white text-black overflow-hidden">
      {/* Mobile sidebar */}
      <AdminSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onRequestLogout={() => setShowLogoutConfirm(true)}
      />

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:top-0 md:left-0 md:z-50 md:h-screen md:w-72 md:block">
        <AdminSidebar onRequestLogout={() => setShowLogoutConfirm(true)} />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 flex h-11 items-center justify-between border-b border-black/15 bg-white px-4 text-black md:pl-72">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg border border-black/10 p-2 hover:bg-black/5 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold uppercase tracking-wide">Admin Panel</div>
        </div>
      </header>

      <main className="absolute top-11 left-0 right-0 bottom-0 md:left-72 md:top-11 overflow-y-auto">
        <div className="pt-2 px-6 md:px-6 mx-auto max-w-8xl xl:max-w-[1440px]">{children}</div>
      </main>

      <Modal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirmer déconnexion"
        centered
      >
        <p className="mb-4 text-sm text-black/70">Voulez-vous vraiment vous déconnecter ?</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
            onClick={handleLogout}
          >
            Confirmer
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl border border-black/20 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/5"
            onClick={() => setShowLogoutConfirm(false)}
          >
            Annuler
          </button>
        </div>
      </Modal>
    </div>
  );
}
