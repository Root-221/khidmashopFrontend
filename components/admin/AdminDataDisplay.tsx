"use client";

import { ReactNode, useMemo, useState } from "react";
import { Loader } from "@/components/ui/Loader";
import { ViewToggle } from "@/components/admin/ViewToggle";
import { Pagination } from "@/components/admin/Pagination";

interface AdminDataDisplayProps<T> {
  data: T[];
  isLoading?: boolean;
  itemsPerPage?: number;
  renderGrid: (items: T[]) => ReactNode;
  renderList: (items: T[]) => ReactNode;
  emptyMessage?: string;
  defaultView?: "grid" | "list";
}

export function AdminDataDisplay<T>({
  data,
  isLoading = false,
  itemsPerPage = 8,
  renderGrid,
  renderList,
  emptyMessage = "Aucune donnée disponible",
  defaultView = "grid",
}: AdminDataDisplayProps<T>) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultView);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage]);
  
  const paginatedData = useMemo(() => {
    return data.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-base p-8 text-center text-sm text-black/55">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <ViewToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          itemCount={paginatedData.length}
          totalCount={data.length}
        />
      </div>

      {/* Data Display */}
      <div>
        {viewMode === "grid" ? renderGrid(paginatedData) : renderList(paginatedData)}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
