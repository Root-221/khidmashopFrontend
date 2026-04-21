import { Grid3X3, List } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  itemCount: number;
  totalCount: number;
}

export function ViewToggle({ viewMode, onViewModeChange, itemCount, totalCount }: ViewToggleProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "grid"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-black/5"
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          Grille
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-black/5"
          }`}
        >
          <List className="h-4 w-4" />
          Liste
        </button>
      </div>
      <div className="text-sm text-black/60 text-center sm:text-right">
        {itemCount} sur {totalCount} éléments
      </div>
    </div>
  );
}