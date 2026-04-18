import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CarouselImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}

const emptyCarousel: Partial<CarouselImage> = {
  id: "",
  url: "",
  title: "",
  description: "",
  order: 0,
};

export const AdminCarousel = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CarouselImage> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("carousel_images")
        .select("*")
        .order("order", { ascending: true });
      
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching carousel images:", error);
      toast.error("Failed to load carousel images");
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchImages();
  });

  const handleEdit = (image: CarouselImage) => setEditing(image);

  const handleAdd = () => {
    const newOrder = Math.max(...images.map(i => i.order), -1) + 1;
    setEditing({ ...emptyCarousel, id: `carousel-${Date.now()}`, order: newOrder });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: editing.id,
        url: editing.url,
        title: editing.title,
        description: editing.description || null,
        order: editing.order,
      };

      const { error } = await supabase
        .from("carousel_images")
        .upsert(payload);

      if (error) throw error;

      toast.success("Carousel image saved successfully");
      setEditing(null);
      fetchImages();
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
    const currentIndex = images.findIndex(img => img.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[currentIndex];
    newImages[currentIndex] = newImages[newIndex];
    newImages[newIndex] = temp;

    // Update order values
    newImages.forEach((img, idx) => img.order = idx);

    setImages(newImages);

    try {
      const updates = newImages.map(img => ({
        id: img.id,
        order: img.order
      }));

      const { error } = await supabase
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl font-bold">Manage Hero Carousel</h2>
          <p className="text-muted-foreground text-sm">Add, edit, or reorder carousel images displayed on the homepage.</p>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" /> Add Image
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {images.map((image, index) => (
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
                      disabled={index === images.length - 1}
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
              </div>
            </div>
          ))}
        </div>
        {images.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No carousel images found. Click "Add Image" to get started.
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
              {editing?.url && (
                <img src={editing.url} alt="Preview" className="w-full h-48 object-cover rounded-lg mt-2" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editing?.title || ""}
                onChange={(e) => setEditing(prev => prev ? { ...prev, title: e.target.value } : null)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={3}
                value={editing?.description || ""}
                onChange={(e) => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}
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
