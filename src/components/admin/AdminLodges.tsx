import { memo, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useDestinationLodges } from "@/hooks/useDestinationLodges";
import { supabase } from "@/integrations/supabase/client";
import { compressImage, uploadFileToSupabase } from "@/lib/image-utils";
import { destinationLodges as localDestinationLodges } from "@/data/destinations-lodges";

type LodgeEditor = {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  category: "luxury" | "mid-range" | "budget" | "camp";
  description: string;
  story: string;
  featuresText: string;
  image: string;
  imagesText: string;
  website: string;
  order: number;
};

const emptyLodge: LodgeEditor = {
  id: "",
  destinationId: "tsavo",
  destinationName: "Tsavo",
  name: "",
  category: "mid-range",
  description: "",
  story: "",
  featuresText: "",
  image: "",
  imagesText: "",
  website: "",
  order: 0,
};

export const AdminLodges = () => {
  const { data: grouped = [], isLoading } = useDestinationLodges();
  const destinationOptions = useMemo(() => {
    const localOrder = new Map(localDestinationLodges.map((g, i) => [g.destinationId, i]));
    const opts = grouped.map((g) => ({ id: g.destinationId, name: g.destinationName }));
    opts.sort((a, b) => (localOrder.get(a.id) ?? 500) - (localOrder.get(b.id) ?? 500));
    return opts;
  }, [grouped]);

  const [selectedDestination, setSelectedDestination] = useState<string>("tsavo");
  const [editing, setEditing] = useState<LodgeEditor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"original" | "optimized">("original");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!destinationOptions.length) return;
    if (!destinationOptions.some((o) => o.id === selectedDestination)) {
      setSelectedDestination(destinationOptions[0].id);
    }
  }, [destinationOptions, selectedDestination]);

  const lodges = useMemo(
    () =>
      grouped
        .filter((group) => group.destinationId === selectedDestination)
        .flatMap((group) =>
          group.lodges.map((lodge, idx) => ({
            ...lodge,
            destinationId: group.destinationId,
            destinationName: group.destinationName,
            order: idx,
          }))
        ),
    [grouped, selectedDestination]
  );

  const handleAdd = () => {
    const option = destinationOptions.find((item) => item.id === selectedDestination) ?? destinationOptions[0];
    if (!option) {
      toast.error("No destinations available yet.");
      return;
    }
    setEditing({
      ...emptyLodge,
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `lodge-${Date.now()}`,
      destinationId: option.id,
      destinationName: option.name,
      order: lodges.length,
    });
  };

  const handleSeedFromLocalData = async () => {
    setIsSubmitting(true);
    try {
      const seedRows = localDestinationLodges.flatMap((group) =>
        group.lodges.map((lodge, index) => ({
          id: lodge.id,
          destination_id: group.destinationId,
          destination_name: group.destinationName,
          name: lodge.name,
          category: lodge.category,
          description: lodge.description,
          story: lodge.story,
          features: lodge.features || [],
          image: lodge.image,
          images: lodge.images || (lodge.image ? [lodge.image] : []),
          website: lodge.website || null,
          order: index,
        }))
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("destination_lodges").upsert(seedRows);
      if (error) throw error;

      toast.success("Lodges copied to database");
      queryClient.invalidateQueries({ queryKey: ["destination-lodges"] });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to seed lodges. Run create-destination-lodges-table.sql and fix-destination-lodges-rls.sql."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (lodge: (typeof lodges)[number]) => {
    setEditing({
      id: lodge.id,
      destinationId: lodge.destinationId,
      destinationName: lodge.destinationName,
      name: lodge.name,
      category: lodge.category,
      description: lodge.description,
      story: lodge.story,
      featuresText: (lodge.features || []).join("\n"),
      image: lodge.image,
      imagesText: (lodge.images || []).join("\n"),
      website: lodge.website || "",
      order: lodge.order || 0,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lodge?")) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("destination_lodges").delete().eq("id", id);
      if (error) throw error;
      toast.success("Lodge deleted");
      queryClient.invalidateQueries({ queryKey: ["destination-lodges"] });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete lodge. Check table and RLS (fix-destination-lodges-rls.sql)."
      );
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fileToUpload = uploadMode === "optimized" ? await compressImage(file) : file;
      const url = await uploadFileToSupabase(fileToUpload);
      setEditing((prev) => (prev ? { ...prev, image: url } : prev));
      toast.success("Cover image uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Cover upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setIsSubmitting(true);
    try {
      const payload = {
        id: editing.id,
        destination_id: editing.destinationId,
        destination_name: editing.destinationName,
        name: editing.name.trim(),
        category: editing.category,
        description: editing.description.trim(),
        story: editing.story.trim(),
        features: editing.featuresText.split("\n").map((x) => x.trim()).filter(Boolean),
        image: editing.image.trim(),
        images: editing.imagesText.split("\n").map((x) => x.trim()).filter(Boolean),
        website: editing.website.trim() || null,
        order: Number.isFinite(editing.order) ? editing.order : 0,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("destination_lodges").upsert(payload);
      if (error) throw error;

      toast.success("Lodge saved");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["destination-lodges"] });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save lodge. Run create-destination-lodges-table.sql and fix-destination-lodges-rls.sql."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Lodges & camps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rows in Supabase override the bundled list when IDs match. &quot;Copy built-in&quot; runs once to populate the table,
            then edit here.
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button type="button" variant="outline" onClick={handleSeedFromLocalData} disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Copy built-in list
          </Button>
          <Select value={selectedDestination} onValueChange={setSelectedDestination}>
            <SelectTrigger className="w-[220px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {destinationOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="shrink-0 bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Lodge
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-2 gap-4 p-6 lg:grid-cols-3">
          {lodges.map((lodge) => (
            <div key={lodge.id} className="rounded-xl border border-border overflow-hidden bg-background">
              <img src={lodge.image} alt={lodge.name} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-1">
                <p className="font-semibold">{lodge.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{lodge.category}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(lodge)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(lodge.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lodges.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">No lodges for this destination yet.</div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.name?.trim() ? "Edit lodge / camp" : "Add lodge / camp"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Destination</label>
                <Select
                  value={editing?.destinationId || selectedDestination}
                  onValueChange={(value) => {
                    const option = destinationOptions.find((x) => x.id === value) || destinationOptions[0];
                    setEditing((prev) => (prev ? { ...prev, destinationId: option.id, destinationName: option.name } : prev));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={editing?.category || "mid-range"}
                  onValueChange={(value) =>
                    setEditing((prev) =>
                      prev ? { ...prev, category: value as LodgeEditor["category"] } : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="mid-range">Mid-range</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="camp">Tented camp / camp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Lodge or camp name</label>
                <Input
                  value={editing?.name || ""}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Display order</label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={editing?.order ?? 0}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, order: Number.parseInt(e.target.value, 10) || 0 } : prev
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first in the list.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Cover Image URL</label>
              <Input value={editing?.image || ""} onChange={(e) => setEditing((prev) => (prev ? { ...prev, image: e.target.value } : prev))} required />
              <div className="grid grid-cols-2 gap-2">
                <Select value={uploadMode} onValueChange={(v) => setUploadMode(v as "original" | "optimized")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Keep original quality</SelectItem>
                    <SelectItem value="optimized">Optimize for speed</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="file" accept="image/*" onChange={handleUploadCover} disabled={uploading} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea rows={3} value={editing?.description || ""} onChange={(e) => setEditing((prev) => (prev ? { ...prev, description: e.target.value } : prev))} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Story</label>
              <Textarea rows={3} value={editing?.story || ""} onChange={(e) => setEditing((prev) => (prev ? { ...prev, story: e.target.value } : prev))} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Highlights (one per line)</label>
              <Textarea rows={4} value={editing?.featuresText || ""} onChange={(e) => setEditing((prev) => (prev ? { ...prev, featuresText: e.target.value } : prev))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Gallery Images (one URL per line)</label>
              <Textarea rows={4} value={editing?.imagesText || ""} onChange={(e) => setEditing((prev) => (prev ? { ...prev, imagesText: e.target.value } : prev))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Website</label>
              <Input value={editing?.website || ""} onChange={(e) => setEditing((prev) => (prev ? { ...prev, website: e.target.value } : prev))} placeholder="https://..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting || uploading}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(AdminLodges);
