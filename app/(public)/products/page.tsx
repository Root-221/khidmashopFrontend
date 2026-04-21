import { Suspense } from "react";
import { Loader } from "@/components/ui/Loader";
import { ProductsPageClient } from "./ProductsPageClient";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-safe py-6">
          <Loader className="py-10" />
        </div>
      }
    >
      <ProductsPageClient />
    </Suspense>
  );
}
