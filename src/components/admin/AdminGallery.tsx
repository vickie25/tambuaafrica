import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLocalImageUpload } from "@/components/admin/AdminLocalImageUpload";
import {
  DEFAULT_GALLERY_FOLDER_IMAGES,
  defaultGalleryId,
} from "@/lib/gallery-defaults";
import { galleryImageSrc, isValidGallerySrc } from "@/lib/gallery-defaults";
import { normalizePublicImagePath } from "@/lib/public-image-path";

type GalleryRow = {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
};

const emptyRow = (): Partial<GalleryRow> => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `gallery-${Date.now()}`,
  url: "",
  title: "Tambua Gallery",
  description: "Real safari moments from Tambua Africa",
  order: 0,
});

export const AdminGallery = () => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<GalleryRow> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"original" | "optimized">("original");
  const [batchUploading, setBatchUploading] = useState(false);

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from("carousel_images")
        .select("*")
        .eq("section", "gallery")
        .order("order", { ascending: true });
      if (error) throw error;
      setRows((data || []) as GalleryRow[]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRows();
  }, []);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
    queryClient.invalidateQueries({ queryKey: ["carousel-image-items"] });
  };

  const handleBatchFromComputer = async (urls: string[]) => {
    if (!urls.length) return;
    setBatchUploading(true);
    try {
      const startOrder = (rows.at(-1)?.order ?? -1) + 1;
      const payload = urls.map((url, index) => ({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `gallery-batch-${Date.now()}-${index}`,
        url,
        title: "Tambua Gallery",
        description: "Real safari moments from Tambua Africa",
        order: startOrder + index,
        section: "gallery" as const,
      }));
      const { error } = await supabase.from("carousel_images").upsert(payload);
      if (error) throw error;
      await fetchRows();
      invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save gallery images");
    } finally {
      setBatchUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidGallerySrc(editing?.url)) {
      toast.error("Upload an image or paste a valid URL first.");
      return;
    }
    const normalizedUrl = normalizePublicImagePath(editing.url);
    setIsSubmitting(true);
    try {
      const payload = {
        id: editing.id!,
        url: normalizedUrl,
        title: editing.title?.trim() || "Tambua Gallery",
        description: editing.description?.trim() || "Real safari moments from Tambua Africa",
        order: Number.isFinite(editing.order) ? editing.order! : rows.length,
        section: "gallery" as const,
      };
      const { error } = await supabase.from("carousel_images").upsert(payload);
      if (error) throw error;
      toast.success("Gallery image saved");
      setEditing(null);
      await fetchRows();
      invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this image from the public gallery?")) return;
    try {
      const { error } = await supabase.from("carousel_images").delete().eq("id", id);
      if (error) throw error;
      toast.success("Removed");
      await fetchRows();
      invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const move = async (id: string, direction: "up" | "down") => {
    const sorted = [...rows].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((r) => r.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[target];
    try {
      const { error: errA } = await supabase.from("carousel_images").update({ order: b.order }).eq("id", a.id);
      if (errA) throw errA;
      const { error: errB } = await supabase.from("carousel_images").update({ order: a.order }).eq("id", b.id);
      if (errB) throw errB;
      await fetchRows();
      invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Reorder failed");
    }
  };

  const handleImportDefaults = async () => {
    const existingUrls = new Set(rows.map((r) => normalizePublicImagePath(r.url)));
    const missing = DEFAULT_GALLERY_FOLDER_IMAGES.map((url, index) => ({ url, index })).filter(
      ({ url }) => !existingUrls.has(normalizePublicImagePath(url)),
    );
    if (!missing.length) {
      toast.info("All default gallery photos are already in the database.");
      return;
    }
    if (
      !confirm(
        `Add ${missing.length} built-in gallery photo(s) to the database? Your uploaded photos will not be removed.`,
      )
    ) {
      return;
    }
    setIsSubmitting(true);
    try {
      const startOrder = (rows.at(-1)?.order ?? -1) + 1;
      const payload = missing.map(({ url, index }, i) => ({
        id: defaultGalleryId(index),
        url,
        title: "Tambua Gallery",
        description: "Real safari moments from Tambua Africa",
        order: startOrder + i,
        section: "gallery" as const,
      }));
      const { error } = await supabase.from("carousel_images").upsert(payload);
      if (error) throw error;
      toast.success(`Added ${payload.length} default photo(s)`);
      await fetchRows();
      invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Could not import default photos");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Site gallery</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Photos on the public <strong>/gallery</strong> page. Uploads are saved to the database and shown together with
            the site&apos;s built-in photos (nothing is deleted when you upload).
          </p>
        </div>

        <AdminLocalImageUpload
          multiple
          uploadMode={uploadMode}
          onUploadModeChange={setUploadMode}
          disabled={batchUploading}
          buttonLabel="Upload multiple gallery photos"
          onBatchUploaded={(urls) => void handleBatchFromComputer(urls)}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-accent hover:bg-accent/90"
            onClick={() => {
              const next = emptyRow();
              next.order = (rows.at(-1)?.order ?? -1) + 1;
              setEditing(next);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add one image
          </Button>
          <Button type="button" variant="outline" onClick={() => void fetchRows()}>
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || batchUploading}
            onClick={() => void handleImportDefaults()}
          >
            Restore default site photos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[...rows]
          .sort((a, b) => a.order - b.order)
          .map((row, index, sorted) => (
            <div key={row.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <img
                src={galleryImageSrc(row.url)}
                alt={row.title || "Gallery"}
                className="h-48 w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0.35";
                }}
              />
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium">{row.title || "Gallery"}</p>
                <p className="text-xs text-muted-foreground">Order: {row.order}</p>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => void move(row.id, "up")}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={index === sorted.length - 1}
                    onClick={() => void move(row.id, "down")}
                  >
                    ↓
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(row)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDelete(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {rows.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No gallery images yet. Use &quot;Upload multiple gallery photos&quot; above.
        </p>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.url ? "Edit gallery image" : "Add gallery image"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <AdminLocalImageUpload
              uploadMode={uploadMode}
              onUploadModeChange={setUploadMode}
              disabled={isSubmitting}
              onSingleUploaded={(url) => setEditing((prev) => (prev ? { ...prev, url } : prev))}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Or paste image URL</label>
              <Input
                value={editing?.url || ""}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, url: e.target.value } : prev))}
                placeholder="https://..."
              />
            </div>
            {editing?.url && (
              <img src={editing.url} alt="Preview" className="h-40 w-full rounded-lg object-cover" />
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title (optional)</label>
              <Input
                value={editing?.title || ""}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Caption (optional)</label>
              <Textarea
                rows={2}
                value={editing?.description || ""}
                onChange={(e) =>
                  setEditing((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Display order</label>
              <Input
                type="number"
                value={editing?.order ?? 0}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev ? { ...prev, order: Number.parseInt(e.target.value, 10) || 0 } : prev,
                  )
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGallery;
