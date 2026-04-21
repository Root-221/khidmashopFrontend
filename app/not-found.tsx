import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-safe flex min-h-screen items-center justify-center py-10">
      <div className="card-base max-w-md space-y-4 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-black/45">404</p>
        <h1 className="text-3xl font-semibold">Page introuvable</h1>
        <p className="text-sm text-black/60">La page demandée n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn-base bg-black px-5 py-3 text-white">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
