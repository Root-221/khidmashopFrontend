"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { listCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive } from "@/services/category.service";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminDataDisplay } from "@/components/admin/AdminDataDisplay";
import { Category } from "@/types/product";
import { generateSlug } from "@/utils/slugify";
import { useToast } from "@/hooks/useToast";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({ 
    queryKey: ["admin-categories"], 
    queryFn: () => listCategories({ includeInactive: true }) 
  });
  const toast = useToast();

  const defaultCategoryImage = "/assets/categories/fashion.jpg";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    active: true,
    image: defaultCategoryImage,
  });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await toggleCategoryActive(id, active);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const reset = () => {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      active: true,
      image: defaultCategoryImage,
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => (editing ? updateCategory(editing.id, form) : createCategory(form)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      reset();
      setOpen(false);
      toast.success("Catégorie", editing ? "mise à jour" : "créée");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
      toast.error("Catégorie", message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteTarget(null);
      toast.success("Catégorie", "supprimée");
    },
  });

  const openModal = (category?: Category) => {
    if (category) {
      setEditing(category);
      setForm({
        name: category.name,
        slug: category.slug,
        active: category.active,
        image: category.image || defaultCategoryImage,
      });
    } else {
      reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const activateCategories = categories.filter(c => c.active);
  const inactiveCategories = categories.filter(c => !c.active);
  const allCategories = [...activateCategories, ...inactiveCategories];

  const renderCategoryCard = (category: Category, isGrid: boolean) => {
    const imageSrc = category.image || defaultCategoryImage;
    const statusBadge = (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border border-black/10 ${
          category.active ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {category.active ? "Actif" : "Inactif"}
      </span>
    );

    return (
      <div
        key={category.id}
        className={`p-4 rounded-lg border border-black/20 bg-white hover:bg-black/5 transition-colors ${
          !isGrid ? "flex items-center justify-between gap-4" : ""
        }`}
      >
        <div className={`flex ${isGrid ? "flex-col gap-3" : "items-center gap-4 flex-1"}`}>
          <div
            className={`relative overflow-hidden rounded-2xl bg-slate-100 ${
              isGrid ? "h-32 w-full" : "h-16 w-16"
            }`}
          >
            <Image
              src={imageSrc}
              alt={`Photo catégorie ${category.name}`}
              fill
              sizes={isGrid ? "100vw" : "64px"}
              className="object-cover"
            />
          </div>
          <div className={isGrid ? "" : "flex-1"}>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-black">{category.name}</p>
              {!isGrid && statusBadge}
            </div>
            <p className="text-xs text-black/60">Slug: {category.slug || "N/A"}</p>
            {isGrid && <div>{statusBadge}</div>}
          </div>
        </div>
        <div className={`flex gap-2 ${isGrid ? "mt-3" : ""}`}>
          <button
            onClick={() => openModal(category)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 transition-colors ${
              isGrid ? "flex-1 justify-center" : ""
            }`}
          >
            <Pencil className="h-4 w-4" />
            Éditer
          </button>
            <button
              onClick={() => setDeleteTarget(category)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors ${
                isGrid ? "flex-1 justify-center" : ""
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Suppr.
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <AdminHeader
          icon={<Tag className="h-6 w-6" />}
          title="Catégories"
          description="Gérez les collections de votre boutique"
          breadcrumbs={[{ label: "Accueil" }, { label: "Catégories" }]}
        />
        <AdminButton
          onClick={() => openModal()}
          className="h-fit"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </AdminButton>
      </div>

      {/* Data Display with Grid/List and Pagination */}
      <AdminCard>
        <AdminDataDisplay
          data={allCategories}
          isLoading={isLoading}
          itemsPerPage={8}
          defaultView="grid"
          emptyMessage="Aucune catégorie trouvée"
          renderGrid={(categories) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => renderCategoryCard(category, true))}
            </div>
          )}
          renderList={(categories) => (
            <div className="space-y-2">
              {categories.map((category) => renderCategoryCard(category, false))}
            </div>
          )}
        />
      </AdminCard>

      {/* Modal */}
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          title={editing ? "Éditer la catégorie" : "Ajouter une catégorie"}
        >
          <div className="space-y-4">
            <AdminInput
              label="Nom"
              value={form.name}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  name: value,
                  slug: editing ? prev.slug : generateSlug(value),
                }));
              }}
              placeholder="Ex: Vêtements"
              required
            />
            <AdminInput
              label="Slug (auto généré)"
              value={form.slug}
              readOnly
              placeholder="auto-generated"
              helperText="Généré automatiquement à partir du nom"
            />
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-black/70">
                Photo (upload)
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded border border-black/20 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result;
                    if (typeof result === "string") {
                      setForm((prev) => ({ ...prev, image: result }));
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            {form.image && form.image !== defaultCategoryImage && (
              <div className="flex items-center gap-3 text-xs text-black/60">
                <span>Prévisualisation :</span>
                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-black/10 bg-black/5">
                  <Image
                    src={form.image}
                    alt={form.name ? `Prévisualisation ${form.name}` : "Prévisualisation catégorie"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded border-black/20"
              />
              <span className="text-sm font-medium text-black">Catégorie active</span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !form.name.trim()}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saveMutation.isPending ? "Enregistrement..." : (editing ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {deleteTarget && (
        <Modal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Supprimer la catégorie"
        >
          <div className="space-y-4">
            <p className="text-sm text-black/70">
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget.name}</strong> ? Cette action est irréversible et supprimera également tous les produits rattachés.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-black/5 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
