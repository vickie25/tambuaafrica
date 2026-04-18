import { useState, memo } from "react";
import { useDestinations } from "@/hooks/useDestinations";
import { supabase } from "@/integrations/supabase/client";
import { Destination } from "@/data/destinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { compressImage, createPreviewUrl, uploadFileToSupabase } from "@/lib/image-utils";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/supabase-config";

const emptyDestination: Partial<Destination> = {
  id: "", name: "", country: "", description: "", image: "", safariCount: 0
};

export const AdminDestinations = () => {
  const { data: destinations = [], isLoading } = useDestinations();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<Destination> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"processing" | "uploading" | null>(null);

  const handleEdit = (dest: Destination) => setEditing(dest);
  
  const handleAdd = () => {
    setEditing({ ...emptyDestination, id: `dest-${Date.now()}` });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show instant local preview
    const previewUrl = createPreviewUrl(file);
    const previousImage = editing?.image;
    setEditing((prev) => prev ? { ...prev, image: previewUrl } : null);

    setUploading(true);
    setUploadStatus("processing");
    try {
      // 2. Optimized compression
      const compressedFile = await compressImage(file);
      
      setUploadStatus("uploading");
      // 3. Optimized upload
      const publicUrl = await uploadFileToSupabase(compressedFile);

      // 4. Final URL update
      setEditing((prev) => prev ? { ...prev, image: publicUrl } : null);
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
        const { error } = await (supabase as any).from("destinations").upsert(payload);
        if (error) throw error;
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
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90"><Plus className="w-4 h-4 mr-2"/> Add Destination</Button>
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
        <DialogContent className="sm:max-w-xl">
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
