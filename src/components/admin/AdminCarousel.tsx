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
import { AdminLocalImageUpload } from "@/components/admin/AdminLocalImageUpload";

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
  hero: "Hero",
  activities: "Activities",
  destinations: "Destinations",
  gallery: "Gallery",
  feature_wild: "Wild strip",
  feature_culture: "Culture strip",
  feature_luxury: "Luxury strip",
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
  const [uploadMode, setUploadMode] = useState<"original" | "optimized">("original");
  const [activityIcon, setActivityIcon] = useState<string>("compass");
  const [selectedActivityTitle, setSelectedActivityTitle] = useState<string>(activityTemplates[0].title);
  const queryClient = useQueryClient();

  const homepageSections = (Object.keys(sectionLabelMap) as CarouselImage["section"][]).filter(
    (s) => s !== "gallery",
  );

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

      toast.success("Activities reset from template");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.url || editing.url.startsWith("blob:")) {
      toast.error("Wait for upload to finish, or paste a direct image URL.");
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

      toast.success("Removed");
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
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Homepage images</h2>
          <p className="mt-1 text-sm text-muted-foreground">Slides and strips by section. Order is saved per row.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Section: <span className="font-medium text-foreground">{sectionLabelMap[selectedSection]}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as CarouselImage["section"])}>
            <SelectTrigger className="w-[180px] shrink-0">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {homepageSections.map((section) => (
                <SelectItem key={section} value={section}>
                  {sectionLabelMap[section]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="shrink-0 bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> Add image
          </Button>
          {selectedSection === "activities" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadDefaultActivities}
              disabled={isSubmitting}
              className="shrink-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Reset activities
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Gallery photos are managed in the <strong>Gallery</strong> section of the admin menu.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="space-y-6 p-5 sm:p-6">
          {selectedSection === "activities" && groupedActivityImages ? (
            Object.entries(groupedActivityImages).map(([activityTitle, imagesInGroup]) => (
              <div key={activityTitle} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{activityTitle}</h3>
                  <span className="text-xs text-muted-foreground">
                    {imagesInGroup.length} image{imagesInGroup.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
            <DialogTitle>{editing?.id?.startsWith("carousel-") ? "New image" : "Edit image"}</DialogTitle>
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
              <AdminLocalImageUpload
                uploadMode={uploadMode}
                onUploadModeChange={setUploadMode}
                onSingleUploaded={(url) => setEditing((prev) => (prev ? { ...prev, url } : null))}
              />
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
                  {homepageSections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {sectionLabelMap[section]}
                    </SelectItem>
                  ))}
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
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
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
