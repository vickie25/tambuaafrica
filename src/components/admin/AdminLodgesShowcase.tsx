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
import type { LodgesServiceShowcaseCard } from "@/lib/lodges-service-showcase-defaults";

type FormState = {
  name: string;
  area: string;
  category: string;
  note: string;
  image_url: string;
};

const emptyForm = (): FormState => ({
  name: "",
  area: "",
  category: "Safari lodge",
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

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lodges_service_cards")
      .select("id, sort_order, name, area, category, note, image_url")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      console.warn(error);
      toast.error("Could not load cards (run create-lodges-service-cards.sql if the table is missing).");
      setRows([]);
      return;
    }
    setRows(
      (data ?? []).map((r) => ({
        id: r.id,
        sort_order: r.sort_order,
        name: r.name,
        area: r.area,
        category: r.category,
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
      category: row.category,
      note: row.note,
      image_url: row.image_url,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const name = form.name.trim();
    const area = form.area.trim();
    const category = form.category.trim();
    const note = form.note.trim();
    const image_url = form.image_url.trim();
    if (!name || !image_url) {
      toast.error("Name and image URL are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("lodges_service_cards")
          .update({ name, area, category, note, image_url })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Card updated");
      } else {
        const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
        const { error } = await supabase.from("lodges_service_cards").insert({
          name,
          area,
          category: category || "Safari lodge",
          note,
          image_url,
          sort_order: nextOrder,
        });
        if (error) throw error;
        toast.success("Card added");
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

  const remove = async (id: string) => {
    if (!window.confirm("Delete this card from the live page?")) return;
    setBusyId(id);
    try {
      const { error } = await supabase.from("lodges_service_cards").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-medium">How this works</p>
        <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
          If this list is <strong>empty</strong>, the lodge service page uses the built-in gallery. As soon as you add{" "}
          <strong>one</strong> card, the page shows <strong>only</strong> cards from this table — add every card you want
          visible, or delete all rows to go back to the built-in set.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add card
        </Button>
        <Button type="button" variant="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No custom cards yet — the site is using the default gallery.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{row.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.area} · {row.category}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.note}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1">
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
                  disabled={busyId !== null}
                  onClick={() => openEdit(row)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
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
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit card" : "New card"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                placeholder="https://… (Unsplash or your CDN; use modest width for speed)"
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
              <Input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category label</label>
              <Input
                placeholder="Safari lodge, Tented camp, …"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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
