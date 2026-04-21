type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={`animate-pulse rounded-2xl bg-black/5 ${className ?? ""}`} />;
}
