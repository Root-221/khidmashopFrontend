type LoaderProps = {
  label?: string;
  className?: string;
};

export function Loader({ label = "Chargement...", className }: LoaderProps) {
  return (
    <div className={`flex items-center gap-3 text-sm text-black/60 ${className ?? ""}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-black" />
      <span>{label}</span>
    </div>
  );
}
