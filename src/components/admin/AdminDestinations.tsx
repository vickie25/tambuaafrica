import { useState, memo } from "react";
import { useDestinations } from "@/hooks/useDestinations";
import { supabase } from "@/integrations/supabase/client";
import { Destination } from "@/data/destinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { compressImage, createPreviewUrl, uploadFileToSupabase } from "@/lib/image-utils";

const emptyDestination: Partial<Destination> = {
  id: "", name: "", country: "", description: "", image: "", safariCount: 0
};

const websiteDestinations = [
  { id: "amboseli", name: "Amboseli", country: "Kenya", description: "Famous for elephant herds and iconic Mount Kilimanjaro views across open savannah plains.", image: "/images/amboseli-real.webp", safari_count: 1 },
  { id: "masai-mara", name: "Masai Mara", country: "Kenya", description: "World-renowned reserve for big cats and the Great Migration across dramatic grasslands.", image: "/images/maasai-mara-real.webp", safari_count: 4 },
  { id: "nakuru", name: "Lake Nakuru", country: "Kenya", description: "Rift Valley park known for flamingos, rhino sanctuary protection, and scenic escarpments.", image: "/images/destiations/Lake Nakuru/lake elementaita.webp", safari_count: 1 },
  { id: "tsavo", name: "Tsavo", country: "Kenya", description: "Expansive wilderness with red elephants, open plains, and authentic off-the-beaten-track safari drives.", image: "/images/destiations/Tsavo/voi safari lodge4.webp", safari_count: 0 },
  { id: "diani", name: "Diani", country: "Kenya", description: "White-sand Indian Ocean coastline ideal for beach holidays, snorkeling, and relaxed luxury stays.", image: "/images/diani.webp", safari_count: 1 },
  { id: "samburu", name: "Samburu", country: "Kenya", description: "Northern frontier reserve with rare species, dramatic landscapes, and rich Samburu culture.", image: "/images/destiations/Samburu/Saruni.webp", safari_count: 1 },
  { id: "mombasa", name: "Mombasa", country: "Kenya", description: "Historic coastal city blending Swahili culture, beaches, marine parks, and old-town heritage.", image: "/images/mombasa-north-1.webp", safari_count: 1 },
  { id: "wasini", name: "Wasini Island", country: "Kenya", description: "Car-free coral island gateway to dolphin spotting and Kisite Mpunguti marine adventures.", image: "/images/wasini-island-1.webp", safari_count: 1 },
  { id: "chale-island", name: "Chale Island", country: "Kenya", description: "Private coral island retreat near Diani with turquoise waters and exclusive beach luxury.", image: "/images/Chale Island.webp", safari_count: 1 },
  { id: "watamu", name: "Watamu", country: "Kenya", description: "Marine paradise with coral reefs, sea turtles, white beaches, and game-fishing experiences.", image: "/images/watamu-beach.webp", safari_count: 1 },
  { id: "mombasa-north-coast", name: "Mombasa North Coast", country: "Kenya", description: "Lively coast with resort beaches, marine park snorkeling, and easy access to Mombasa landmarks.", image: "/images/mombasa-north-1.webp", safari_count: 1 },
  { id: "mombasa-south-coast", name: "Mombasa South Coast", country: "Kenya", description: "Scenic stretch of palm-lined beaches and calm bays ideal for relaxing coastal escapes.", image: "/images/diani.webp", safari_count: 1 },
] as const;

export const AdminDestinations = () => {
  const { data: destinations = [], isLoading } = useDestinations();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<Destination> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"processing" | "uploading" | null>(null);
  const [uploadMode, setUploadMode] = useState<"original" | "optimized">("original");
  const [galleryText, setGalleryText] = useState("");

  const handleEdit = (dest: Destination) => {
    setEditing(dest);
    setGalleryText((dest.images || []).join("\n"));
  };
  
  const handleAdd = () => {
    setEditing({ ...emptyDestination, id: `dest-${Date.now()}` });
    setGalleryText("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show instant local preview
    const previewUrl = createPreviewUrl(file);
    const previousImage = editing?.image;
    setEditing((prev) => prev ? { ...prev, image: previewUrl } : null);

    setUploading(true);
    setUploadStatus(uploadMode === "optimized" ? "processing" : "uploading");
    try {
      // 2. Optional optimization (based on selected mode)
      const fileToUpload = uploadMode === "optimized" ? await compressImage(file) : file;
      
      setUploadStatus("uploading");
      // 3. Optimized upload
      const publicUrl = await uploadFileToSupabase(fileToUpload);

      // 4. Final URL update
      setEditing((prev) => prev ? { ...prev, image: publicUrl } : null);
      setGalleryText((prev) => {
        const lines = prev.split("\n").map((line) => line.trim()).filter(Boolean);
        if (!lines.includes(publicUrl)) lines.unshift(publicUrl);
        return lines.join("\n");
      });
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      // Revert to previous image
      setEditing((prev) => prev ? { ...prev, image: previousImage } : null);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadStatus(null);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus(uploadMode === "optimized" ? "processing" : "uploading");
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fileToUpload = uploadMode === "optimized" ? await compressImage(file) : file;
        setUploadStatus("uploading");
        const publicUrl = await uploadFileToSupabase(fileToUpload);
        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setGalleryText((prev) => {
          const current = prev.split("\n").map((line) => line.trim()).filter(Boolean);
          const merged = [...uploadedUrls, ...current.filter((url) => !uploadedUrls.includes(url))];
          return merged.join("\n");
        });
        setEditing((prev) => (prev ? { ...prev, image: prev.image || uploadedUrls[0] } : prev));
        toast.success(`${uploadedUrls.length} gallery image(s) uploaded`);
      }
    } catch (error) {
      console.error("Gallery upload error:", error);
      toast.error("Gallery upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadStatus(null);
      e.target.value = "";
    }
  };

  const handleLoadWebsiteDestinations = async () => {
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("destinations").upsert(websiteDestinations);
      if (error) throw error;
      toast.success("Website destinations synced");
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    } catch (error) {
      console.error("Destination sync failed:", error);
      toast.error("Failed to sync website destinations");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: editing.id,
        name: editing.name,
        country: editing.country,
        description: editing.description,
        image: editing.image,
        safari_count: editing.safariCount,
        images: galleryText.split("\n").map((line) => line.trim()).filter(Boolean),
      };

      // Optimistic Update: Update the local cache immediately
      const previousData = queryClient.getQueryData(["destinations"]);
      queryClient.setQueryData(["destinations"], (old: Destination[] = []) => {
        const index = old.findIndex((d) => d.id === payload.id);
        if (index > -1) {
          const updated = [...old];
          updated[index] = { ...payload, safariCount: payload.safari_count } as Destination;
          return updated;
        }
        return [...old, { ...payload, safariCount: payload.safari_count } as Destination];
      });

      setEditing(null);

      // Perform the actual cloud save with a timeout
      const cloudSync = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baseClient = (supabase as any).from("destinations");
        const { error } = await baseClient.upsert(payload);
        if (!error) return;
        if (String(error.message || "").toLowerCase().includes("images")) {
          const { images, ...fallbackPayload } = payload;
          const { error: retryError } = await baseClient.upsert(fallbackPayload);
          if (retryError) throw retryError;
          toast.info("Saved without gallery column. Run the destination-images migration to store multiple images.");
          return;
        }
        throw error;
      };

      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Cloud Sync Timeout")), 20000)
      );

      try {
        await Promise.race([cloudSync(), timeout]);
        toast.success("Destination saved to cloud");
        queryClient.invalidateQueries({ queryKey: ["destinations"] });
      } catch (error: any) {
        console.error("Cloud save failed:", error);
        // Revert optimistic update
        queryClient.setQueryData(["destinations"], previousData);
        const msg = error.message === "Cloud Sync Timeout" 
          ? "Cloud sync timed out. Data is saved locally but not in the database. Check your internet connection." 
          : `Cloud save failed: ${error.message}. Ensure you ran the SQL script in Supabase.`;
        toast.error(msg, { duration: 5000 });
      }
    } catch (error) {
      console.error("Critical save error:", error);
      toast.error("Failed to prepare data for saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("destinations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Destination deleted");
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-accent"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl font-bold">Manage Destinations</h2>
          <p className="text-muted-foreground text-sm">Add, edit, or remove travel destinations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleLoadWebsiteDestinations} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Sync Website Destinations
          </Button>
          <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90"><Plus className="w-4 h-4 mr-2"/> Add Destination</Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Image</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Country</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Safaris</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest) => (
                <tr key={dest.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <img src={dest.image} alt={dest.name} className="w-16 h-12 object-cover rounded-md" />
                  </td>
                  <td className="p-4 font-medium">{dest.name}</td>
                  <td className="p-4">{dest.country}</td>
                  <td className="p-4">{dest.safariCount}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(dest as Destination)}><Edit className="w-4 h-4"/></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(dest.id)}><Trash2 className="w-4 h-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id?.startsWith("dest-") ? "Add New Destination" : "Edit Destination"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={editing?.name || ""} onChange={(e) => setEditing(prev => ({ ...prev!, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input value={editing?.country || ""} onChange={(e) => setEditing(prev => ({ ...prev!, country: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Safari Count</label>
                <Input type="number" value={editing?.safariCount || 0} onChange={(e) => setEditing(prev => ({ ...prev!, safariCount: Number(e.target.value) }))} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea rows={4} value={editing?.description || ""} onChange={(e) => setEditing(prev => ({ ...prev!, description: e.target.value }))} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <div className="flex items-center gap-4">
                {editing?.image && <img src={editing.image} alt="Preview" className="w-16 h-16 rounded object-cover" />}
                <div className="flex-1">
                  <div className="space-y-1 mb-2">
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
                  </div>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  {uploading && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin"/> 
                      {uploadStatus === "processing" ? "Optimizing image..." : "Uploading to cloud..."}
                    </p>
                  )}
                </div>
              </div>
              <Input placeholder="Or paste image URL" value={editing?.image || ""} onChange={(e) => setEditing(prev => ({ ...prev!, image: e.target.value }))} className="mt-2" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gallery Images (one URL per line)</label>
              <Input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploading} />
              <Textarea
                rows={5}
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
                placeholder="https://.../image1.webp&#10;https://.../image2.webp"
              />
              <p className="text-xs text-muted-foreground">
                Gallery URLs are saved to DB when the `images` column exists.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting || uploading}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(AdminDestinations);
