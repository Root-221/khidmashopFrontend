import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "KHIDMA SHOP",
  description: "Khidma Shop is a mobile-first ecommerce and admin dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-white font-sans text-black antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
