"use client";

import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNavbar } from "@/components/layout/MobileNavbar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { AssistantWidget } from "@/components/chat/AssistantWidget";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main className="pb-20 md:pb-0">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <CartDrawer />
      <AssistantWidget />
      <MobileNavbar />
    </div>
  );
}
