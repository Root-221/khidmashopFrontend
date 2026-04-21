import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AdminCard } from "./AdminCard";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "red" | "purple" | "orange";
};

const colorMap = {
  blue: "from-black to-black",
  green: "from-black to-black",
  red: "from-black to-black",
  purple: "from-black to-black",
  orange: "from-black to-black",
};

export function AdminStatCard({
  label,
  value,
  icon,
  trend,
  color = "blue",
}: AdminStatCardProps) {
  const bgGradient = colorMap[color];

  return (
    <AdminCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-black/60">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-black">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`rounded-lg bg-gradient-to-br ${bgGradient} p-3 text-white`}>
            {icon}
          </div>
        )}
      </div>
    </AdminCard>
  );
}
