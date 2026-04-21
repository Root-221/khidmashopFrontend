import Link from "next/link";
import { Facebook, Instagram, PhoneCall, MessageCircleMore } from "lucide-react";

const footerLinks = [
  { href: "/products", label: "Catalogue" },
  { href: "/cart", label: "Panier" },
  { href: "/checkout", label: "Commander" },
  { href: "/orders", label: "Mes commandes" },
];

const socialIcons = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "WhatsApp", icon: MessageCircleMore },
];

const contactNumbers = [
  { label: "+221 78 012 60 13" },
  { label: "+221 77 862 70 52" },
];

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="container-safe py-10 sm:py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-black/45">KHIDMA SHOP</p>
            <h2 className="text-2xl font-semibold tracking-tight">Une boutique simple, claire et facile à utiliser.</h2>
            <p className="max-w-md text-sm leading-6 text-black/60">
              Découvrez des vêtements, des chaussures et de l&apos;électronique avec des produits utiles et faciles à choisir.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Navigation</p>
            <ul className="mt-4 space-y-3 text-sm text-black/60">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link className="transition hover:text-black" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-black/60">
              {contactNumbers.map((item, index) => (
                <li key={index}>
                  <a className="inline-flex items-center gap-2 transition hover:text-black" href={`tel:${item.label.replace(/\s/g, '')}`}>
                    <PhoneCall className="h-4 w-4" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Réseaux sociaux</p>
            <ul className="mt-4 space-y-3">
              {socialIcons.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="text-sm text-black/60">
                    <Icon className="h-5 w-5 transition hover:text-black cursor-default" />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
          <div className="mt-8 pt-6 border-t border-black/10 text-center text-xs text-black/45">
            © 2026 KHIDMA SHOP. Tous droits réservés.
          </div>
        </div>
    </footer>
  );
}
