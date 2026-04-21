import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex flex-col gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-black/60 text-center sm:text-left">
        Page {currentPage} sur {totalPages}
      </div>
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pageNum === currentPage
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black/5"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}