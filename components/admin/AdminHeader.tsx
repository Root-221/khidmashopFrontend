import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type AdminHeaderProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
};

export function AdminHeader({ icon, title, description, action, breadcrumbs }: AdminHeaderProps) {
  return (
    <header className="space-y-0 py-0">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-black/50">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              {item.href ? (
                <a href={item.href} className="hover:text-black transition-colors">
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <ChevronRight className="h-2.5 w-2.5" />}
            </div>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {icon && (
            <div className="rounded-lg bg-black p-1.5 text-white">
              {icon}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-black leading-tight">{title}</h1>
          {description && <p className="text-sm text-black/50 mt-0.5">{description}</p>}
        </div>
        {action && <div className="ml-auto flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}
