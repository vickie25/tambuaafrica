import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2, Compass, Palmtree, Binoculars, Mountain, Activity, Wind } from "lucide-react";
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
    | "gallery"
    | "feature_wild"
    | "feature_culture"
    | "feature_luxury";
}

const sectionLabelMap: Record<CarouselImage["section"], string> = {
  hero: "Hero Section",
  activities: "Activities Section",
  destinations: "Destinations Section",
  gallery: "Gallery Section",
  feature_wild: "Experience the Wild",
  feature_culture: "Our Cultural Heritage",
  feature_luxury: "Luxury Reimagined",
};

const activityIconOptions = [
  { value: "compass", label: "Compass" },
  { value: "palmtree", label: "Palm Tree" },
  { value: "binoculars", label: "Binoculars" },
  { value: "mountain", label: "Mountain" },
  { value: "activity", label: "Activity" },
  { value: "wind", label: "Wind" },
] as const;

const activityIconPreviewMap = {
  compass: Compass,
  palmtree: Palmtree,
  binoculars: Binoculars,
  mountain: Mountain,
  activity: Activity,
  wind: Wind,
} as const;

const defaultActivities = [
  {
    title: "Game Drive",
    url: "/images/popular activities/game drives.webp",
    description: "Track the Big Five with expert guides on sunrise and sunset drives across iconic savannah parks.",
    icon: "binoculars",
  },
  {
    title: "Beach Holidays",
    url: "/images/popular activities/beach.webp",
    description: "Unwind on white-sand beaches, enjoy ocean views, and experience laid-back coastal island life.",
    icon: "palmtree",
  },
  {
    title: "Zipline Canopy",
    url: "/images/popular activities/Zipline.webp",
    description: "Glide above forest canopies for adrenaline-filled aerial views and unforgettable nature thrills.",
    icon: "wind",
  },
  {
    title: "Cultural Tours",
    url: "/images/popular activities/culture tours.webp",
    description: "Meet local communities, explore living traditions, and discover authentic East African heritage.",
    icon: "compass",
  },
  {
    title: "Hiking Adventures",
    url: "/images/popular activities/Hiking.webp",
    description: "Take guided trails through hills and mountains, from scenic day hikes to challenging summit routes.",
    icon: "mountain",
  },
  {
    title: "Bungee & Jumping",
    url: "/images/popular activities/Bangee and Jumping.webp",
    description: "Push your limits with high-energy jumps and bungee experiences designed for pure adventure.",
    icon: "activity",
  },
] as const;

const defaultGalleryImages = [
  "/images/real images frm Tambua/at MAasai mara.jpeg",
  "/images/real images frm Tambua/DR. Amos Shibale from Seattle USA.jpeg",
  "/images/real images frm Tambua/A drive.jpeg",
  "/images/real images frm Tambua/Maasai Culture.jpeg",
  "/images/real images frm Tambua/Dr. Palca  Shibale from Seattle USa.jpeg",
  "/images/real images frm Tambua/Tourists at Nairobi park.jpeg",
  "/images/real images frm Tambua/Tourists with the team at the park.jpeg",
  "/images/real images frm Tambua/lion at Nairobi park.jpeg",
  "/images/real images frm Tambua/Nairobi park.jpeg",
  "/images/real images frm Tambua/safari vehicle.jpeg",
  "/images/real images frm Tambua/Team Bonding with Maasai Culture.jpeg",
  "/images/real images frm Tambua/team outside.jpeg",
  "/images/real images frm Tambua/Lion spotting.jpeg",
  "/images/real images frm Tambua/Tourist learning about the culture.jpeg",
  "/images/real images frm Tambua/Team.jpeg",
  "/images/real images frm Tambua/Zebra at Nairobi park.jpeg",
  "/images/real images frm Tambua/hotel.jpeg",
  "/images/real images frm Tambua/A snap with tourist.jpeg",
  "/images/real images frm Tambua/Tourist happy with Tambua africa Services.jpeg",
  "/images/real images frm Tambua/Drive Vehicle.jpeg",
  "/images/real images frm Tambua/Drive at the park.jpeg",
  "/images/real images frm Tambua/ready for the tour.jpeg",
  "/images/real images frm Tambua/St the park drive.jpeg",
  "/images/real images frm Tambua/Tambua Africa safari vehicle.jpeg",
  "/images/real images frm Tambua/Mrs Odilliah Sagali from Seattle USA.jpeg",
  "/images/real images frm Tambua/the safari.jpeg",
  "/images/real images frm Tambua/Eng. Briscan Shibale from Seattle USA.jpeg",
] as const;

const activityTemplates = defaultActivities.map((item) => ({
  title: item.title,
  description: item.description,
  icon: item.icon,
}));

const extractActivityIconFromDescription = (description?: string | null) => {
  const text = (description || "").trim();
  const match = text.match(/^\[\[icon:([a-z_]+)\]\]\s*/i);
  const icon = match?.[1]?.toLowerCase() || "compass";
  const cleaned = text.replace(/^\[\[icon:[a-z_]+\]\]\s*/i, "").trim();
  return { icon, description: cleaned };
};

const composeActivityDescription = (icon: string, description?: string | null) => {
  const cleaned = (description || "").trim();
  return `[[icon:${icon}]] ${cleaned}`.trim();
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
  const [uploadMode, setUploadMode] = useState<"original" | "optimized">("original");
  const [activityIcon, setActivityIcon] = useState<string>("compass");
  const [selectedActivityTitle, setSelectedActivityTitle] = useState<string>(activityTemplates[0].title);
  const queryClient = useQueryClient();

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.from("carousel_images").select("*").order("order", { ascending: true });

      if (error) throw error;
      type Row = Record<string, unknown> & { section?: string | null };
      const normalized = (data || []).map((item: Row) => ({
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

  const handleEdit = (image: CarouselImage) => {
    if (image.section === "activities") {
      const parsed = extractActivityIconFromDescription(image.description);
      setActivityIcon(parsed.icon);
      setSelectedActivityTitle(image.title || activityTemplates[0].title);
      setEditing({ ...image, description: parsed.description });
      return;
    }
    setEditing(image);
  };

  const handleAdd = () => {
    const sectionImages = images.filter((img) => img.section === selectedSection);
    const newOrder = Math.max(...sectionImages.map(i => i.order), -1) + 1;
    const generatedId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `carousel-${Date.now()}`;
    if (selectedSection === "activities") {
      const template = activityTemplates.find((a) => a.title === selectedActivityTitle) || activityTemplates[0];
      setActivityIcon(template.icon);
      setEditing({
        ...emptyCarousel,
        id: generatedId,
        order: newOrder,
        section: selectedSection,
        title: template.title,
        description: template.description,
      });
      return;
    }

    setEditing({ ...emptyCarousel, id: generatedId, order: newOrder, section: selectedSection });
    setActivityIcon("compass");
  };

  const handleLoadDefaultActivities = async () => {
    setIsSubmitting(true);
    try {
      const payload = defaultActivities.map((item, index) => ({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `carousel-activities-${Date.now()}-${index}`,
        url: item.url,
        title: item.title,
        description: composeActivityDescription(item.icon, item.description),
        order: index,
        section: "activities" as const,
      }));

      const { error: deleteError } = await supabase.from("carousel_images").delete().eq("section", "activities");
      if (deleteError) throw deleteError;

      const { error } = await supabase.from("carousel_images").upsert(payload);
      if (error) throw error;

      toast.success("Default activities loaded successfully");
      await fetchImages();
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-image-items"] });
    } catch (error) {
      console.error("Error loading default activities:", error);
      toast.error("Failed to load default activities");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadFolderGallery = async () => {
    setIsSubmitting(true);
    try {
      const payload = defaultGalleryImages.map((url, index) => ({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `carousel-gallery-${Date.now()}-${index}`,
        url,
        title: "Tambua Gallery",
        description: "Real safari moments from Tambua Africa",
        order: index,
        section: "gallery" as const,
      }));

      const { error: deleteError } = await supabase.from("carousel_images").delete().eq("section", "gallery");
      if (deleteError) throw deleteError;

      const { error } = await supabase.from("carousel_images").upsert(payload);
      if (error) throw error;

      toast.success("Gallery loaded from real images folder");
      await fetchImages();
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-image-items"] });
    } catch (error) {
      console.error("Error loading folder gallery:", error);
      const message = String((error as { message?: string })?.message || "").toLowerCase();
      if (message.includes("carousel_images_section_check") || message.includes("violates check constraint")) {
        toast.error(
          "Your DB section constraint doesn't include 'gallery'. Run scripts/extend-carousel-sections.sql in Supabase, then retry."
        );
      } else {
        toast.error("Failed to load gallery images");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = createPreviewUrl(file);
    const previousImage = editing?.url;
    setEditing((prev) => (prev ? { ...prev, url: previewUrl } : null));

    setUploading(true);
    setUploadStatus(uploadMode === "optimized" ? "processing" : "uploading");
    try {
      const fileToUpload = uploadMode === "optimized" ? await compressImage(file) : file;
      setUploadStatus("uploading");

      const publicUrl = await uploadFileToSupabase(fileToUpload);
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
      let resolvedTitle = (editing.title || "").trim() || fallbackTitle;
      const resolvedDescriptionRaw = editing.description?.trim();
      let resolvedDescription =
        resolvedDescriptionRaw && resolvedDescriptionRaw.length > 0
          ? resolvedDescriptionRaw
          : existingImage?.description || null;
      if ((editing.section || selectedSection) === "activities") {
        const template = activityTemplates.find((a) => a.title === selectedActivityTitle);
        if (template) {
          resolvedTitle = template.title;
          resolvedDescription = template.description;
        }
        resolvedDescription = composeActivityDescription(activityIcon, resolvedDescription);
      }

      const payload = {
        id: editing.id,
        url: editing.url,
        title: resolvedTitle,
        description: resolvedDescription,
        order: Number.isFinite(editing.order) ? editing.order : 0,
        section: editing.section || selectedSection,
      };

      const { error } = await supabase.from("carousel_images").upsert(payload);

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("section")) {
          toast.error(
            "Carousel `section` column is required. Run `scripts/extend-carousel-sections.sql` (and related migrations) in Supabase, then try again."
          );
        }
        throw error;
      }

      toast.success("Carousel image saved successfully");
      setEditing(null);
      await fetchImages();
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-image-items"] });
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
      await fetchImages();
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-image-items"] });
    } catch (error) {
      console.error("Error deleting carousel image:", error);
      toast.error("Failed to delete carousel image");
    }
  };

  const moveImage = async (id: string, direction: "up" | "down", activityTitle?: string) => {
    const sectionImages = images
      .filter((img) => img.section === selectedSection)
      .sort((a, b) => a.order - b.order);

    const scopeImages =
      selectedSection === "activities" && activityTitle
        ? sectionImages.filter((img) => (img.title || "") === activityTitle)
        : sectionImages;

    const currentIndex = scopeImages.findIndex((img) => img.id === id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || newIndex < 0 || newIndex >= scopeImages.length) return;

    const currentItem = scopeImages[currentIndex];
    const targetItem = scopeImages[newIndex];
    const currentOrder = currentItem.order;
    const targetOrder = targetItem.order;

    setImages((prev) =>
      prev.map((img) => {
        if (img.id === currentItem.id) return { ...img, order: targetOrder };
        if (img.id === targetItem.id) return { ...img, order: currentOrder };
        return img;
      })
    );

    try {
      const { error } = await supabase
        .from("carousel_images")
        .upsert([
          { id: currentItem.id, order: targetOrder },
          { id: targetItem.id, order: currentOrder },
        ]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["carousel-images"] });
      queryClient.invalidateQueries({ queryKey: ["carousel-image-items"] });
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
  const groupedActivityImages =
    selectedSection === "activities"
      ? sectionImages.reduce<Record<string, CarouselImage[]>>((acc, image) => {
          const key = image.title || "Untitled Activity";
          if (!acc[key]) acc[key] = [];
          acc[key].push(image);
          return acc;
        }, {})
      : null;

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
              <SelectItem value="gallery">Gallery Section</SelectItem>
                <SelectItem value="feature_wild">Experience the Wild</SelectItem>
                <SelectItem value="feature_culture">Our Cultural Heritage</SelectItem>
                <SelectItem value="feature_luxury">Luxury Reimagined</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" /> Add Image
          </Button>
          {selectedSection === "activities" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadDefaultActivities}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Load Default Activities
            </Button>
          )}
          {selectedSection === "gallery" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadFolderGallery}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Load Folder Gallery
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-6 space-y-6">
          {selectedSection === "activities" && groupedActivityImages ? (
            Object.entries(groupedActivityImages).map(([activityTitle, imagesInGroup]) => (
              <div key={activityTitle} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{activityTitle}</h3>
                  <span className="text-xs text-muted-foreground">
                    {imagesInGroup.length} image{imagesInGroup.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imagesInGroup
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((image, index) => {
                    return (
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
                                onClick={() => moveImage(image.id, "up", activityTitle)}
                                disabled={index === 0}
                                className="bg-white/90 hover:bg-white"
                              >
                                ↑
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => moveImage(image.id, "down", activityTitle)}
                                disabled={index === imagesInGroup.length - 1}
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
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          )}
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
                <div className="space-y-1">
                  <label className="text-sm font-medium">Upload Mode</label>
                  <Select
                    value={uploadMode}
                    onValueChange={(v) => setUploadMode(v as "original" | "optimized")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Keep original quality</SelectItem>
                      <SelectItem value="optimized">Optimize for speed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {uploadMode === "original"
                      ? "Best visual quality. Larger files may load slower on weak connections."
                      : "Smaller files for faster loading with slight quality reduction on very large images."}
                  </p>
                </div>
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                {uploading && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {uploadStatus === "processing"
                      ? "Optimizing image..."
                      : "Uploading to cloud..."}
                  </p>
                )}
              </div>
              {editing?.url && (
                <img src={editing.url} alt="Preview" className="w-full h-48 object-cover rounded-lg mt-2" />
              )}
            </div>

            {(editing?.section || selectedSection) === "activities" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose Activity</label>
                <Select
                  value={selectedActivityTitle}
                  onValueChange={(value) => {
                    setSelectedActivityTitle(value);
                    const template = activityTemplates.find((a) => a.title === value);
                    if (!template) return;
                    setActivityIcon(template.icon);
                    setEditing((prev) =>
                      prev
                        ? { ...prev, title: template.title, description: template.description }
                        : prev
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTemplates.map((template) => (
                      <SelectItem key={template.title} value={template.title}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  New uploads are added as carousel images to the selected activity.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Title (optional)</label>
              <Input
                value={editing?.title || ""}
                onChange={(e) => setEditing(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Optional: auto-generated if left blank"
                disabled={(editing?.section || selectedSection) === "activities"}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                rows={3}
                value={editing?.description || ""}
                onChange={(e) => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Optional: existing description is preserved when blank"
                disabled={(editing?.section || selectedSection) === "activities"}
              />
            </div>
            {(editing?.section || selectedSection) === "activities" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity Icon</label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  {(() => {
                    const Icon = activityIconPreviewMap[(activityIcon as keyof typeof activityIconPreviewMap) || "compass"];
                    return <Icon className="w-4 h-4 text-primary" />;
                  })()}
                  <span className="text-sm text-muted-foreground">
                    Preview: {activityIconOptions.find((option) => option.value === activityIcon)?.label || "Compass"}
                  </span>
                </div>
                <Select value={activityIcon} onValueChange={setActivityIcon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityIconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                  <SelectItem value="gallery">Gallery Section</SelectItem>
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
