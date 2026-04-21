export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function statusTone(value: string) {
  if (value === "DELIVERED" || value === "CONFIRMED") return "border-black bg-black text-white";
  if (value === "PENDING") return "border-black/15 bg-black/5 text-black";
  if (value === "CANCELLED") return "border-red-200 bg-red-50 text-red-600";
  return "border-black/10 bg-white text-black/70";
}
