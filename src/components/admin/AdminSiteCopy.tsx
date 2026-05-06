import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  SITE_MARKETING_DEFAULTS,
  SITE_MARKETING_IDS,
  type SiteMarketingBlockId,
} from "@/lib/site-marketing-defaults";

type FormRow = { eyebrow: string; headline: string; body: string };

const SECTIONS: { id: SiteMarketingBlockId; title: string; hint: string }[] = [
  {
    id: SITE_MARKETING_IDS.homeServicesIntro,
    title: "Homepage: services strip",
    hint: "Above the three cards on the home page (ticketing, transfers, lodges).",
  },
  {
    id: SITE_MARKETING_IDS.lodgesServiceHero,
    title: "Lodge & camp service page: hero",
    hint: "Top banner on /services/lodges-camps (eyebrow, title, intro line). Image grid: Admin → Lodge page gallery.",
  },
];

export const AdminSiteCopy = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<SiteMarketingBlockId, FormRow>>(() => ({
    [SITE_MARKETING_IDS.homeServicesIntro]: { ...SITE_MARKETING_DEFAULTS[SITE_MARKETING_IDS.homeServicesIntro] },
    [SITE_MARKETING_IDS.lodgesServiceHero]: { ...SITE_MARKETING_DEFAULTS[SITE_MARKETING_IDS.lodgesServiceHero] },
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const ids = SECTIONS.map((s) => s.id);
      const { data, error } = await supabase.from("site_marketing_blocks").select("id, eyebrow, headline, body").in("id", ids);
      if (cancelled) return;
      if (error) {
        console.warn(error);
        toast.error("Could not load copy (run create-site-marketing-blocks.sql if the table is missing).");
        setLoading(false);
        return;
      }
      setForms((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          const row = data?.find((r) => r.id === id);
          const d = SITE_MARKETING_DEFAULTS[id as SiteMarketingBlockId];
          next[id as SiteMarketingBlockId] = {
            eyebrow: row?.eyebrow?.trim() || d.eyebrow,
            headline: row?.headline?.trim() || d.headline,
            body: row?.body?.trim() || d.body,
          };
        }
        return next;
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (id: SiteMarketingBlockId) => {
    const row = forms[id];
    setSavingId(id);
    try {
      const { error } = await supabase.from("site_marketing_blocks").upsert(
        {
          id,
          eyebrow: row.eyebrow.trim(),
          headline: row.headline.trim(),
          body: row.body.trim(),
        },
        { onConflict: "id" },
      );
      if (error) throw error;
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["site-marketing-blocks"] });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingId(null);
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
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Shorter lines read better in the header. Use line breaks in the body field only when you need a new paragraph
        (the site keeps one block of text per field).
      </p>
      {SECTIONS.map((section) => (
        <div key={section.id} className="rounded-lg border border-border bg-card p-5 shadow-none">
          <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{section.hint}</p>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Eyebrow (small line above title)</label>
              <Input
                value={forms[section.id].eyebrow}
                onChange={(e) => setForms((f) => ({ ...f, [section.id]: { ...f[section.id], eyebrow: e.target.value } }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Headline</label>
              <Input
                value={forms[section.id].headline}
                onChange={(e) => setForms((f) => ({ ...f, [section.id]: { ...f[section.id], headline: e.target.value } }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Body</label>
              <Textarea
                rows={4}
                value={forms[section.id].body}
                onChange={(e) => setForms((f) => ({ ...f, [section.id]: { ...f[section.id], body: e.target.value } }))}
                className="min-h-[100px] resize-y"
              />
            </div>
            <Button type="button" onClick={() => save(section.id)} disabled={savingId === section.id}>
              {savingId === section.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save this section
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
