import { ReactNode } from "react";

type Column = {
  header: string;
  className?: string;
};

type AdminTableProps<T> = {
  columns: Column[];
  rows: T[];
  renderRow: (row: T) => ReactNode;
  renderMobileRow: (row: T) => ReactNode;
  emptyLabel?: string;
};

export function AdminTable<T>({
  columns,
  rows,
  renderRow,
  renderMobileRow,
  emptyLabel = "Aucune donnée disponible.",
}: AdminTableProps<T>) {
  if (!rows.length) {
    return <div className="rounded-3xl border border-dashed border-black/10 p-8 text-center text-sm text-black/55">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {rows.map((row, index) => (
          <div key={index}>{renderMobileRow(row)}</div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-[2rem] border border-black/10 bg-white/90 shadow-sm backdrop-blur md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse text-left">
          <thead className="bg-black/[0.03] text-xs uppercase tracking-[0.22em] text-black/50">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={`px-4 py-3 ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-black/5 transition hover:bg-black/[0.015]">
                {renderRow(row)}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
