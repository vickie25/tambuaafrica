import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { compressImage, createPreviewUrl, uploadFileToSupabase } from "@/lib/image-utils";

interface CarouselImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
  section:
    | "hero"
    | "activities"
    | "destinations"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury";
}

const sectionLabelMap: Record<CarouselImage["section"], string> = {
  hero: "Hero Section",
  activities: "Activities Section",
  destinations: "Destinations Section",
  feature_wild: "Experience the Wild",
  feature_culture: "Our Cultural Heritage",
  feature_luxury: "Luxury Reimagined",
};

const emptyCarousel: Partial<CarouselImage> = {
  id: "",
  url: "",
  title: "",
  description: "",
  order: 0,
  section: "hero",
};

export const AdminCarousel = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [selectedSection, setSelectedSection] = useState<CarouselImage["section"]>("hero");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CarouselImage> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"processing" | "uploading" | null>(null);
  const queryClient = useQueryClient();

  const fetchImages = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("carousel_images")
        .select("*")
        .order("order", { ascending: true });
      
      if (error) throw error;
      const normalized = (data || []).map((item: any) => ({
        ...item,
        section: (item.section || "hero") as CarouselImage["section"],
      }));
      setImages(normalized);
    } catch (error) {
      console.error("Error fetching carousel images:", error);
      toast.error("Failed to load carousel images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleEdit = (image: CarouselImage) => setEditing(image);

  const handleAdd = () => {
    const sectionImages = images.filter((img) => img.section === selectedSection);
    const newOrder = Math.max(...sectionImages.map(i => i.order), -1) + 1;
    const generatedId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `carousel-${Date.now()}`;
    setEditing({ ...emptyCarousel, id: generatedId, order: newOrder, section: selectedSection });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = createPreviewUrl(file);
    const previousImage = editing?.url;
    setEditing((prev) => (prev ? { ...prev, url: previewUrl } : null));

    setUploading(true);
    setUploadStatus("processing");
    try {
      const compressedFile = await compressImage(file);
      setUploadStatus("uploading");

      const publicUrl = await uploadFileToSupabase(compressedFile);
      setEditing((prev) => (prev ? { ...prev, url: publicUrl } : null));
      toast.success("Carousel image uploaded");
    } catch (error) {
      console.error("Carousel upload error:", error);
      setEditing((prev) => (prev ? { ...prev, url: previousImage } : null));
      toast.error("Image upload failed. Please try again or paste a URL.");
    } finally {
      setUploading(false);
      setUploadStatus(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.url || editing.url.startsWith("blob:")) {
      toast.error("Please wait for upload to complete or paste a valid image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const existingImage = images.find((img) => img.id === editing.id);
      const fallbackTitle =
        existingImage?.title ||
        `${sectionLabelMap[(editing.section || selectedSection) as CarouselImage["section"]]} Image ${((editing.order ?? 0) + 1).toString()}`;
      const resolvedTitle = (editing.title || "").trim() || fallbackTitle;
      const resolvedDescriptionRaw = editing.description?.trim();
      const resolvedDescription =
        resolvedDescriptionRaw && resolvedDescriptionRaw.length > 0
          ? resolvedDescriptionRaw
          : existingImage?.description || null;

      const payload = {
        id: editing.id,
        url: editing.url,
        title: resolvedTitle,
        description: resolvedDescription,
        order: Number.isFinite(editing.order) ? editing.order : 0,
        section: editing.section || selectedSection,
      };

      let { error } = await (supabase as any)
        .from("carousel_images")
        .upsert(payload);

      // Backward compatibility if DB column `section` has not been added yet.
      if (error?.message?.toLowerCase().includes("section")) {
        const retry = await (supabase as any)
          .from("carousel_images")
          .upsert({
            id: payload.id,
            url: payload.url,
            title: payload.title,
            description: payload.description,
            order: payload.order,
          });
        error = retry.error;
        if (!error) {
          toast.info("Saved without section. Run section migration SQL to enable per-section carousel management.");
        }
      }

      if (error) throw error;

      toast.success("Carousel image saved successfully");
      setEditing(null);
      await fetchImages();
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
    } catch (error) {
      console.error("Error saving carousel image:", error);
      toast.error("Failed to save carousel image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this carousel image?")) return;
    
    try {
      const { error } = await supabase
        .from("carousel_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Carousel image deleted successfully");
      fetchImages();
    } catch (error) {
      console.error("Error deleting carousel image:", error);
      toast.error("Failed to delete carousel image");
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const sectionImages = images.filter((img) => img.section === selectedSection);
    const currentIndex = sectionImages.findIndex(img => img.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sectionImages.length) return;

    const newImages = [...sectionImages];
    const temp = newImages[currentIndex];
    newImages[currentIndex] = newImages[newIndex];
    newImages[newIndex] = temp;

    // Update order values
    newImages.forEach((img, idx) => img.order = idx);

    const otherSections = images.filter((img) => img.section !== selectedSection);
    setImages([...otherSections, ...newImages].sort((a, b) => a.order - b.order));

    try {
      const updates = newImages.map(img => ({
        id: img.id,
        order: img.order,
      }));

      const { error } = await (supabase as any)
        .from("carousel_images")
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error("Error reordering images:", error);
      toast.error("Failed to reorder images");
      fetchImages();
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const sectionImages = images.filter((image) => image.section === selectedSection);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl font-bold">Manage Hero Carousel</h2>
          <p className="text-muted-foreground text-sm">
            Add, edit, or reorder carousel images displayed on the homepage.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Currently editing: <span className="font-medium">{sectionLabelMap[selectedSection]}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as CarouselImage["section"])}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero Section</SelectItem>
              <SelectItem value="activities">Activities Section</SelectItem>
              <SelectItem value="destinations">Destinations Section</SelectItem>
                <SelectItem value="feature_wild">Experience the Wild</SelectItem>
                <SelectItem value="feature_culture">Our Cultural Heritage</SelectItem>
                <SelectItem value="feature_luxury">Luxury Reimagined</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" /> Add Image
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {sectionImages.map((image, index) => (
            <div key={image.id} className="relative group rounded-xl overflow-hidden border border-border">
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                      className="bg-white/90 hover:bg-white"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === sectionImages.length - 1}
                      className="bg-white/90 hover:bg-white"
                    >
                      ↓
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(image)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-background">
                <p className="font-medium text-sm truncate">{image.title}</p>
                <p className="text-xs text-muted-foreground">Order: {image.order}</p>
                <p className="text-xs text-muted-foreground">
                  Used by: {sectionLabelMap[image.section]}
                </p>
              </div>
            </div>
          ))}
        </div>
        {sectionImages.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No carousel images found for this section. Click "Add Image" to get started.
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id?.startsWith("carousel-") ? "Add New Image" : "Edit Image"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={editing?.url || ""}
                onChange={(e) => setEditing(prev => prev ? { ...prev, url: e.target.value } : null)}
                placeholder="https://example.com/image.jpg"
                required
              />
              <div className="space-y-2">
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {uploadStatus === "processing" ? "Optimizing image..." : "Uploading to cloud..."}
                  </p>
                )}
              </div>
              {editing?.url && (
                <img src={editing.url} alt="Preview" className="w-full h-48 object-cover rounded-lg mt-2" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title (optional)</label>
              <Input
                value={editing?.title || ""}
                onChange={(e) => setEditing(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Optional: auto-generated if left blank"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                rows={3}
                value={editing?.description || ""}
                onChange={(e) => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Optional: existing description is preserved when blank"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Display Order</label>
              <Input
                type="number"
                value={editing?.order || 0}
                onChange={(e) => setEditing(prev => prev ? { ...prev, order: parseInt(e.target.value) } : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <Select
                value={(editing?.section || selectedSection) as CarouselImage["section"]}
                onValueChange={(v) => setEditing((prev) => (prev ? { ...prev, section: v as CarouselImage["section"] } : null))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero Section</SelectItem>
                  <SelectItem value="activities">Activities Section</SelectItem>
                  <SelectItem value="destinations">Destinations Section</SelectItem>
                  <SelectItem value="feature_wild">Experience the Wild</SelectItem>
                  <SelectItem value="feature_culture">Our Cultural Heritage</SelectItem>
                  <SelectItem value="feature_luxury">Luxury Reimagined</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This image will be used in:{" "}
                <span className="font-medium">
                  {sectionLabelMap[(editing?.section || selectedSection) as CarouselImage["section"]]}
                </span>
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting || uploading}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCarousel;
