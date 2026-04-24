"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Box,
  Star,
  Upload,
  X,
  Camera,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";
import { AdminDataDisplay } from "@/components/admin/AdminDataDisplay";
import { createProduct, deleteProduct, listProducts, updateProduct, toggleProductActive } from "@/services/product.service";
import { listCategories } from "@/services/category.service";
import { formatCurrency } from "@/utils/format";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/useToast";

type ProductImageItem = {
  preview: string;
  file?: File;
};

type ProductForm = {
  name: string;
  price: number;
  images: ProductImageItem[];
  categoryId: string;
  categoryName: string;
  brand: string;
  description: string;
  sizes: string;
  colors: string;
  featured: boolean;
  stock: number;
  rating: number;
  active: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  price: 0,
  images: [],
  categoryId: "",
  categoryName: "",
  brand: "",
  description: "",
  sizes: "S,M,L",
  colors: "Noir,Blanc",
  featured: false,
  stock: 0,
  rating: 4.5,
  active: true,
};

const TOTAL_STEPS = 3;

function cleanupImagePreviews(images: ProductImageItem[]) {
  images.forEach((item) => {
    if (item.file) {
      URL.revokeObjectURL(item.preview);
    }
  });
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => listCategories({ includeInactive: true }),
  });

  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const reset = () => {
    setEditing(null);
    setCurrentStep(1);
    setForm((current) => {
      cleanupImagePreviews(current.images);
      return emptyForm;
    });
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 300);
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name,
        price: product.price,
        images: [],
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        brand: product.brand,
        description: product.description,
        sizes: product.sizes.join(","),
        colors: product.colors.join(","),
        featured: product.featured,
        stock: product.stock,
        rating: product.rating,
        active: product.active,
      });
    }
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImages(true);

    try {
      const currentCount = form.images.length;
      const remainingSlots = 5 - currentCount;
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (filesToAdd.length === 0) {
        toast.error("Images", "Maximum 5 images autorisées");
        return;
      }

      const items = filesToAdd.map((file) => ({
        preview: URL.createObjectURL(file),
        file,
      }));
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...items].slice(0, 5),
      }));
    } finally {
      e.target.value = "";
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const target = prev.images[index];
      if (target?.file) {
        URL.revokeObjectURL(target.preview);
      }

      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      };
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    setForm({
      ...form,
      categoryId,
      categoryName: category?.name || "",
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        price: form.price,
        categoryId: form.categoryId,
        brand: form.brand,
        description: form.description,
        sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map(c => c.trim()).filter(Boolean),
        featured: form.featured,
        stock: form.stock,
        rating: form.rating,
        active: form.active,
      };

      if (editing) {
        return updateProduct(editing.id, payload, form.images);
      }
      return createProduct(payload, form.images);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(editing ? "Produit mis à jour" : "Produit créé", form.name);
      handleClose();
    },
    onError: (err: Error) => {
      toast.error("Erreur", err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async (data: { message: string }) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(data.message || "Produit supprimé", deleteTarget?.name || "");
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error("Erreur de suppression", err.message);
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleProductActive(id, active),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return form.name.trim() && form.price > 0 && form.categoryId;
    }
    if (currentStep === 2) {
      return form.sizes.trim() && form.colors.trim();
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader
          breadcrumbs={[{ label: "Accueil" }, { label: "Produits" }]}
          title="Produits"
        />
        <AdminButton onClick={() => openModal()} className="h-fit shrink-0">
          <Plus className="h-4 w-4" />
          Ajouter
        </AdminButton>
      </div>

      <AdminCard>
        <div className="space-y-6">
          <AdminDataDisplay
            data={products}
            isLoading={isLoading}
            itemsPerPage={8}
            defaultView="grid"
            emptyMessage="Aucun produit trouvé"
            renderGrid={(products) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-black/10 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-black/5 overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-black/20">
                          <Box className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 space-y-2">
                        {product.featured && (
                          <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-3">
                        <p className="text-sm text-black/60">{product.categoryName}</p>
                        <h3 className="font-bold text-black line-clamp-2">{product.name}</h3>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-lg text-black">{formatCurrency(product.price)}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium text-black">{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {product.active ? "Actif" : "Inactif"}
                        </span>
                        <span className="text-black/60">{product.stock || 0} en stock</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-black/90 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                          Éditer
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            renderList={(products) => (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-black/10 hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/10">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-black/20">
                          <Box className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-black truncate">{product.name}</h3>
                          <p className="text-sm text-black/60">{product.categoryName}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <span className="font-medium text-black">{formatCurrency(product.price)}</span>
                            <span className="text-black/60">{product.stock || 0} en stock</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {product.active ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openModal(product)}
                            className="px-3 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-black/90 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      </AdminCard>

      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          title={editing ? "Éditer le produit" : "Ajouter un produit"}
          className="max-w-sm sm:max-w-2xl"
        >
          <div className="space-y-5">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      currentStep >= step
                        ? "bg-black text-white"
                        : "bg-black/10 text-black/50"
                    }`}
                  >
                    {currentStep > step ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < TOTAL_STEPS && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        currentStep > step ? "bg-black" : "bg-black/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-black/60 mb-4">
              <span>Informations</span>
              <span>Détails</span>
              <span>Options</span>
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <AdminInput
                  label="Nom du produit"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: T-shirt Premium"
                  required
                />
                <AdminInput
                  label="Marque"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="Ex: Nike"
                />
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">Catégorie</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input-base w-full"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <AdminInput
                  label="Prix"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-base h-24 w-full resize-none"
                    placeholder="Description du produit..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <AdminInput
                  label="Tailles"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="S,M,L,XL"
                  helperText="Séparées par des virgules"
                />
                <AdminInput
                  label="Couleurs"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="Noir,Blanc,Bleu"
                  helperText="Séparées par des virgules"
                />
                <AdminInput
                  label="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <div>
                  <h3 className="font-semibold text-black mb-3">Images (max 5)</h3>
                  <div className="space-y-3">
                    {form.images.map((img, i) => (
                      <div key={`${img.preview}-${i}`} className="relative w-20 h-20 overflow-hidden rounded-lg border border-black/10">
                        <Image
                          src={img.preview}
                          alt={`Preview ${i}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                    {form.images.length < 5 && (
                      <>
                        <button
                          type="button"
                          onClick={() => document.getElementById('camera-input')?.click()}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-black/20 rounded-lg cursor-pointer hover:border-black/40 transition-colors bg-black/5"
                        >
                          <Camera className="h-5 w-5 text-black/60" />
                          <span className="text-sm font-medium text-black">Prendre une photo</span>
                        </button>
                        <input
                          id="camera-input"
                          type="file"
                          accept="image/*"
                          capture
                          onChange={handleImageUpload}
                          disabled={uploadingImages}
                          className="hidden"
                        />
                      </>
                    )}
                    {form.images.length === 0 && (
                      <p className="text-xs text-black/50 text-center">Utilisez la caméra pour prendre des photos du produit</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Options */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <AdminInput
                  label="Note"
                  type="number"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
                  min={0}
                  max={5}
                />
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-black/20"
                  />
                  <span className="text-sm font-medium text-black">En avant (Featured)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 rounded border-black/20"
                  />
                  <span className="text-sm font-medium text-black">Produit actif</span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-black/20 text-black hover:bg-black/5 font-medium transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </button>
              )}
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg border border-black/20 text-black hover:bg-black/5 font-medium transition-colors"
              >
                Annuler
              </button>
              {currentStep < TOTAL_STEPS ? (
                <AdminButton
                  onClick={nextStep}
                  disabled={!canGoNext()}
                  className="flex items-center gap-2"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </AdminButton>
              ) : (
                <AdminButton
                  onClick={() => saveMutation.mutate()}
                  loading={saveMutation.isPending}
                  className="flex-1"
                >
                  {editing ? "Mettre à jour" : "Créer"}
                </AdminButton>
              )}
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Supprimer le produit"
        >
          <div className="space-y-4">
            <p className="text-sm text-black/70">
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget.name}</strong> ? Cette action est irréversible.
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