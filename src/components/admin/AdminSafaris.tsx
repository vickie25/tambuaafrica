import { useState, memo } from "react";
import { useSafaris } from "@/hooks/useSafaris";
import { supabase } from "@/integrations/supabase/client";
import { Safari } from "@/data/safaris";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { AdminLocalImageUpload } from "@/components/admin/AdminLocalImageUpload";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/supabase-config";

const emptySafari: Partial<Safari> = {
  id: "", title: "", location: "", duration: "", price: 0, rating: 5.0, reviews: 0,
  image: "", description: "", highlights: [], category: "Wildlife Safari", stripePriceId: ""
};

const websiteSafaris = [
  {
    id: "2-days-masai-mara",
    title: "2 Days Masai Mara From Nairobi",
    location: "Maasai Mara National Reserve",
    duration: "2 Days / 1 Night",
    price: 500,
    rating: 5,
    reviews: 16,
    image: "/images/maasai-mara-real.webp",
    description: "Short but thrilling safari with classic game drives in the Maasai Mara.",
    highlights: ["Big Five game drives", "Rift Valley route", "Professional guide"],
    category: "Wildlife Safari",
    stripe_price_id: null,
  },
  {
    id: "4-days-mara-nakuru-amboseli",
    title: "4 Days Masai Mara, Lake Nakuru-Amboseli Safari",
    location: "Masai Mara, Lake Nakuru, Amboseli",
    duration: "4 Days / 3 Nights",
    price: 1800,
    rating: 5,
    reviews: 16,
    image: "/images/olga-budko-bFmjyv5uiAU-unsplash.webp",
    description: "Three-park safari combining predators, flamingo lakes, and Kilimanjaro views.",
    highlights: ["Masai Mara", "Lake Nakuru", "Amboseli elephants"],
    category: "Wildlife Safari",
    stripe_price_id: null,
  },
  {
    id: "3-days-masai-mara",
    title: "3 Days Masai Mara Safari",
    location: "Maasai Mara National Reserve",
    duration: "3 Days / 2 Nights",
    price: 900,
    rating: 5,
    reviews: 16,
    image: "/images/maasai-mara-authentic.webp",
    description: "Extended Maasai Mara adventure with more game drive time and rich wildlife encounters.",
    highlights: ["Extended game drives", "Savannah wildlife", "Lodge stay"],
    category: "Wildlife Safari",
    stripe_price_id: null,
  },
  {
    id: "4-days-wildebeest-migration",
    title: "4 Days Wildebeest Migration Safari",
    location: "Masai Mara Game Reserve",
    duration: "4 Days / 3 Nights",
    price: 1600,
    rating: 5,
    reviews: 16,
    image: "/images/Wild beast migration 2.webp",
    description: "Track migration action and predator-prey drama in peak wildlife territory.",
    highlights: ["Migration tracking", "Predator sightings", "Mara river ecosystem"],
    category: "Wildlife Safari",
    stripe_price_id: null,
  },
  {
    id: "5-days-mara-nakuru-naivasha",
    title: "5 Days Masai Mara, Lake Nakuru, Lake Naivasha",
    location: "Masai Mara, Lake Nakuru, Lake Naivasha",
    duration: "5 Days / 4 Nights",
    price: 1700,
    rating: 5,
    reviews: 16,
    image: "/images/beautiful-shot-three-cute-giraffes-field-with-trees-blue-sky.webp",
    description: "Multi-destination itinerary balancing big game, lakes, and scenic boat excursions.",
    highlights: ["Three destinations", "Flamingos and rhinos", "Naivasha boat ride"],
    category: "Wildlife Safari",
    stripe_price_id: null,
  },
  {
    id: "4-days-mara-nakuru",
    title: "4 Days Masai Mara, Lake Nakuru Safari",
    location: "Nairobi, Masai Mara, Nakuru",
    duration: "4 Days / 3 Nights",
    price: 1800,
    rating: 5,
    reviews: 16,
    image: "/images/destiations/Lake Nakuru/lake elementaita.webp",
    description: "Classic twin-park safari linking Mara plains with Nakuru's rift valley wildlife.",
    highlights: ["Big cats and plains", "Rift valley lake park", "Rhino sanctuary"],
    category: "Wildlife Safari",
    stripe_price_id: null,
  },
] as const;

export const AdminSafaris = () => {
  const { data: safaris = [], isLoading } = useSafaris();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<Safari> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"original" | "optimized">("original");
  const [highlightsText, setHighlightsText] = useState("");

  const handleEdit = (safari: Safari) => {
    setEditing(safari);
    setHighlightsText(safari.highlights.join("\n"));
  };

  const handleAdd = () => {
    setEditing({ ...emptySafari, id: `safari-${Date.now()}` });
    setHighlightsText("");
  };

  const handleSyncWebsiteSafaris = async () => {
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("safaris").upsert(websiteSafaris);
      if (error) throw error;
      toast.success("Default safari rows updated");
      queryClient.invalidateQueries({ queryKey: ["safaris"] });
    } catch (error) {
      console.error("Safari sync failed:", error);
      toast.error("Could not sync rows");
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
        title: editing.title,
        location: editing.location,
        duration: editing.duration,
        price: editing.price,
        rating: editing.rating,
        reviews: editing.reviews,
        image: editing.image,
        description: editing.description,
        highlights: highlightsText.split("\n").map(h => h.trim()).filter(Boolean),
        category: editing.category,
        stripe_price_id: editing.stripePriceId,
      };

      // Optimistic Update: Update the local cache immediately
      const previousData = queryClient.getQueryData(["safaris"]);
      queryClient.setQueryData(["safaris"], (old: Safari[] = []) => {
        const index = old.findIndex((s) => s.id === payload.id);
        if (index > -1) {
          const updated = [...old];
          updated[index] = { ...payload, stripePriceId: payload.stripe_price_id } as Safari;
          return updated;
        }
        return [...old, { ...payload, stripePriceId: payload.stripe_price_id } as Safari];
      });

      setEditing(null);

      // Perform the actual cloud save with a timeout
      const cloudSync = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("safaris").upsert(payload);
        if (error) throw error;
      };

      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Cloud Sync Timeout")), 20000)
      );

      try {
        await Promise.race([cloudSync(), timeout]);
        toast.success("Safari saved to cloud");
        queryClient.invalidateQueries({ queryKey: ["safaris"] });
      } catch (error: any) {
        console.error("Cloud save failed:", error);
        // Revert optimistic update
        queryClient.setQueryData(["safaris"], previousData);
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
    if (!confirm("Are you sure you want to delete this safari?")) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("safaris").delete().eq("id", id);
      if (error) throw error;
      toast.success("Safari deleted");
      queryClient.invalidateQueries({ queryKey: ["safaris"] });
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
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold">Manage Safaris</h2>
          <p className="text-muted-foreground text-sm">Add, edit, or remove safari packages.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button type="button" variant="outline" onClick={handleSyncWebsiteSafaris} disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Sync Website Safaris
          </Button>
          <Button onClick={handleAdd} className="shrink-0 bg-accent hover:bg-accent/90"><Plus className="w-4 h-4 mr-2"/> Add Safari</Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Image</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safaris.map((safari) => (
                <tr key={safari.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <img src={safari.image} alt={safari.title} className="w-16 h-12 object-cover rounded-md" />
                  </td>
                  <td className="p-4 font-medium">{safari.title}</td>
                  <td className="p-4">${safari.price}</td>
                  <td className="p-4">{safari.category}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(safari)}><Edit className="w-4 h-4"/></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(safari.id)}><Trash2 className="w-4 h-4"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id?.startsWith("safari-") ? "New package" : "Edit package"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={editing?.title || ""} onChange={(e) => setEditing(prev => ({ ...prev!, title: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input value={editing?.location || ""} onChange={(e) => setEditing(prev => ({ ...prev!, location: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input value={editing?.duration || ""} onChange={(e) => setEditing(prev => ({ ...prev!, duration: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <Input type="number" value={editing?.price || 0} onChange={(e) => setEditing(prev => ({ ...prev!, price: Number(e.target.value) }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={editing?.category} onValueChange={(v) => setEditing(prev => ({ ...prev!, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wildlife Safari">Wildlife Safari</SelectItem>
                    <SelectItem value="Beach Holiday">Beach Holiday</SelectItem>
                    <SelectItem value="Cultural Tour">Cultural Tour</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stripe Price ID</label>
                <Input value={editing?.stripePriceId || ""} onChange={(e) => setEditing(prev => ({ ...prev!, stripePriceId: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea rows={4} value={editing?.description || ""} onChange={(e) => setEditing(prev => ({ ...prev!, description: e.target.value }))} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Highlights (One per line)</label>
              <Textarea rows={4} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder="Big Five Encounters&#10;Sunset Game Drive" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover image</label>
              {editing?.image && <img src={editing.image} alt="Preview" className="h-16 w-16 rounded object-cover" />}
              <AdminLocalImageUpload
                buttonLabel="Upload cover from your computer"
                uploadMode={uploadMode}
                onUploadModeChange={setUploadMode}
                onSingleUploaded={(url) => setEditing((prev) => (prev ? { ...prev, image: url } : null))}
              />
              <Input
                placeholder="Or paste image URL"
                value={editing?.image || ""}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, image: e.target.value } : null))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
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

export default memo(AdminSafaris);
