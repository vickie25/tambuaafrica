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

import { AdminLocalImageUpload } from "@/components/admin/AdminLocalImageUpload";

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

  const handleLoadWebsiteDestinations = async () => {
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("destinations").upsert(websiteDestinations);
      if (error) throw error;
      toast.success("Default destination rows updated");
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
        toast.success("Saved");
        queryClient.invalidateQueries({ queryKey: ["destinations"] });
      } catch (error: any) {
        console.error("Cloud save failed:", error);
        // Revert optimistic update
        queryClient.setQueryData(["destinations"], previousData);
        const msg =
          error.message === "Cloud Sync Timeout"
            ? "Save timed out. Check the connection and try again."
            : `Save failed: ${error.message}`;
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

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Destinations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Parks and regions on the site. Edits go to Supabase.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button type="button" variant="outline" onClick={handleLoadWebsiteDestinations} disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Load built-in list
          </Button>
          <Button onClick={handleAdd} className="shrink-0 bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> Add row
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
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
            <DialogTitle>{editing?.id?.startsWith("dest-") ? "New destination" : "Edit destination"}</DialogTitle>
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
              <label className="text-sm font-medium">Cover image</label>
              {editing?.image && <img src={editing.image} alt="Preview" className="h-16 w-16 rounded object-cover" />}
              <AdminLocalImageUpload
                buttonLabel="Upload cover from your computer"
                uploadMode={uploadMode}
                onUploadModeChange={setUploadMode}
                onSingleUploaded={(url) => {
                  setEditing((prev) => (prev ? { ...prev, image: url } : null));
                  setGalleryText((prev) => {
                    const lines = prev.split("\n").map((line) => line.trim()).filter(Boolean);
                    if (!lines.includes(url)) lines.unshift(url);
                    return lines.join("\n");
                  });
                }}
              />
              <Input placeholder="Or paste image URL" value={editing?.image || ""} onChange={(e) => setEditing(prev => ({ ...prev!, image: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gallery images (one URL per line)</label>
              <AdminLocalImageUpload
                multiple
                buttonLabel="Upload gallery photos from your computer"
                uploadMode={uploadMode}
                onUploadModeChange={setUploadMode}
                onBatchUploaded={(urls) => {
                  setGalleryText((prev) => {
                    const current = prev.split("\n").map((line) => line.trim()).filter(Boolean);
                    const merged = [...urls, ...current.filter((url) => !urls.includes(url))];
                    return merged.join("\n");
                  });
                  setEditing((prev) => (prev ? { ...prev, image: prev.image || urls[0] } : prev));
                }}
              />
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
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
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
