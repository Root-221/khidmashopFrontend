import { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function AdminPageHeader({ eyebrow, title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#111111,#5b5b5b,#111111)]" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-black/45">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="max-w-xl text-sm leading-6 text-black/60 sm:text-base">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
