"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Lock, Mail, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/useToast";
import { adminLogin } from "@/services/auth.service";
import { AdminButton } from "@/components/admin/AdminButton";

export default function AdminRootPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next"));
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN" && !isRedirecting) {
      setIsRedirecting(true);
      router.replace(nextPath ?? "/admin/dashboard");
    }
  }, [user?.role, nextPath, router, isRedirecting]);

  const mutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: () => {
      toast.success("Connexion admin réussie");
      router.push(nextPath ?? "/admin/dashboard");
    },
    onError: (err: Error) => toast.error("Accès refusé", err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <main className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-black/70">Accès équipe KHIDMA</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-black/70">Utilisateur</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded border border-black/20 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
              placeholder="admin@khidma.shop"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-black/70">Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded border border-black/20 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-black/70">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="mr-2 h-4 w-4 border-black"
              />
              Voir le mot de passe
            </label>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Se connecter
          </button>

          {mutation.error && (
            <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {(mutation.error as Error).message}
            </div>
          )}

          <p className="text-center text-xs text-black/50">© 2026 Khidma Shop</p>
        </form>
      </main>
    </div>
  );
}
