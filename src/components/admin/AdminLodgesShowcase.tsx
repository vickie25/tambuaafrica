import { useCallback, useEffect, useState } from "react";
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
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLocalImageUpload } from "@/components/admin/AdminLocalImageUpload";
import {
  DEFAULT_LODGES_SERVICE_SHOWCASE,
  resolveLodgesShowcaseImageUrl,
  type LodgesServiceShowcaseCard,
} from "@/lib/lodges-service-showcase-defaults";

type FormState = {
  name: string;
  area: string;
  note: string;
  image_url: string;
};

const emptyForm = (): FormState => ({
  name: "",
  area: "",
  note: "",
  image_url: "",
});

export const AdminLodgesShowcase = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<LodgesServiceShowcaseCard[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lodges_service_cards")
      .select("id, sort_order, name, area, category, note, image_url")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      console.warn(error);
      toast.error("Could not load lodges (run create-lodges-service-cards.sql if the table is missing).");
      setRows([]);
      return;
    }
    setRows(
      (data ?? []).map((r) => ({
        id: r.id,
        sort_order: r.sort_order,
        name: r.name,
        area: r.area,
        category: r.category ?? "",
        note: r.note,
        image_url: r.image_url,
      })),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const invalidatePublic = () => {
    queryClient.invalidateQueries({ queryKey: ["lodges-service-cards"] });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (row: LodgesServiceShowcaseCard) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      area: row.area,
      note: row.note,
      image_url: row.image_url,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const name = form.name.trim();
    const area = form.area.trim();
    const note = form.note.trim();
    const image_url = form.image_url.trim();
    if (!name) {
      toast.error("Property name is required.");
      return;
    }
    if (!image_url) {
      toast.error("Upload an image or paste an image URL.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("lodges_service_cards")
          .update({ name, area, category: "", note, image_url })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Lodge updated");
      } else {
        const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
        const { error } = await supabase.from("lodges_service_cards").insert({
          name,
          area,
          category: "",
          note,
          image_url,
          sort_order: nextOrder,
        });
        if (error) throw error;
        toast.success("Lodge added");
      }
      setDialogOpen(false);
      invalidatePublic();
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const importDefaults = async () => {
    const existingNames = new Set(rows.map((r) => r.name.toLowerCase().trim()));
    const toAdd = DEFAULT_LODGES_SERVICE_SHOWCASE.filter(
      (d) => !existingNames.has(d.name.toLowerCase().trim()),
    );
    if (!toAdd.length) {
      toast.info("All built-in lodges are already in your list. Edit any card to change its photo.");
      return;
    }
    if (
      !window.confirm(
        `Add ${toAdd.length} built-in lodge(s) so you can edit their photos on the live page? Existing rows are kept.`,
      )
    ) {
      return;
    }
    setImporting(true);
    try {
      let nextOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
      const payload = toAdd.map((d) => ({
        name: d.name,
        area: d.area,
        category: "",
        note: d.note,
        image_url: d.image_url,
        sort_order: nextOrder++,
      }));
      const { error } = await supabase.from("lodges_service_cards").insert(payload);
      if (error) throw error;
      toast.success(`Added ${payload.length} lodge(s) — open Edit to replace photos`);
      invalidatePublic();
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this lodge from the editable list? (Built-in lodges may still appear until you add a custom row.)")) {
      return;
    }
    setBusyId(id);
    try {
      const { error } = await supabase.from("lodges_service_cards").delete().eq("id", id);
      if (error) throw error;
      toast.success("Removed");
      invalidatePublic();
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[index]!;
    const b = rows[j]!;
    const soA = a.sort_order;
    const soB = b.sort_order;
    setBusyId("reorder");
    try {
      const { error: e1 } = await supabase.from("lodges_service_cards").update({ sort_order: soB }).eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("lodges_service_cards").update({ sort_order: soA }).eq("id", b.id);
      if (e2) throw e2;
      invalidatePublic();
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setBusyId(null);
    }
  };

  const previewUrl = form.image_url ? resolveLodgesShowcaseImageUrl({
    id: editingId ?? "preview",
    sort_order: 0,
    name: form.name,
    area: form.area,
    category: "",
    note: form.note,
    image_url: form.image_url,
  }) : "";

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Lodges &amp; camps page grid</p>
        <p className="mt-1">
          Manage the property cards on <strong>/services/lodges-camps</strong>. Upload a photo, edit the name and area,
          reorder with the arrows, or add new lodges. Category labels on images have been removed from the public page.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add lodge
        </Button>
        <Button type="button" variant="secondary" disabled={importing} onClick={() => void importDefaults()}>
          {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Import built-in lodges
        </Button>
        <Button type="button" variant="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom rows yet — the live page uses the built-in set. Click <strong>Import built-in lodges</strong> to
          edit photos here, or <strong>Add lodge</strong> for new properties.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[5/3] bg-muted">
                <img
                  src={resolveLodgesShowcaseImageUrl(row)}
                  alt={row.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="font-semibold text-foreground">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.area || "—"}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{row.note}</p>
                <div className="mt-auto flex flex-wrap gap-1 pt-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={busyId !== null || index === 0}
                    onClick={() => void move(index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={busyId !== null || index === rows.length - 1}
                    onClick={() => void move(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    disabled={busyId !== null}
                    onClick={() => openEdit(row)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit / replace photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={busyId !== null}
                    onClick={() => void remove(row.id)}
                  >
                    {busyId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit lodge" : "Add lodge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <AdminLocalImageUpload
              buttonLabel="Upload photo from your computer"
              onSingleUploaded={(url) => setForm((f) => ({ ...f, image_url: url }))}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-40 w-full rounded-lg object-cover" />
            ) : null}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Or paste image URL</label>
              <Input
                placeholder="https://…"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Property name</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Area / region</label>
              <Input
                placeholder="Masai Mara, Amboseli, …"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Short description</label>
              <Textarea
                rows={4}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="min-h-[96px] resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void save()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
