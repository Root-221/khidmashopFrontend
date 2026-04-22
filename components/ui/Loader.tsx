type LoaderProps = {
  label?: string;
  className?: string;
  white?: boolean;
};

export function Loader({ label = "Chargement...", className, white }: LoaderProps) {
  return (
    <div className={`flex items-center gap-3 text-sm ${white ? "text-white" : "text-black/60"} ${className ?? ""}`}>
      <span className={`h-5 w-5 animate-spin rounded-full border-2 ${white ? "border-white/10 border-t-white" : "border-black/10 border-t-black"}`} />
      <span>{label}</span>
    </div>
  );
}
