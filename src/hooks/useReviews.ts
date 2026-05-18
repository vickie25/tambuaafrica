import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { testimonials as localTestimonials } from "@/data/testimonials";
import { usePublicQueryMode } from "@/lib/use-public-query";

export interface Review {
  id: string;
  author_name: string;
  author_title: string | null;
  author_avatar: string | null;
  quote: string;
  rating: number;
  source: string;
  source_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

function mapLocalTestimonials(): Review[] {
  return localTestimonials.map((t, index) => ({
    id: t.id,
    author_name: t.name,
    author_title: t.title,
    author_avatar: t.avatar,
    quote: t.quote,
    rating: t.rating,
    source: "manual",
    source_url: null,
    is_active: true,
    display_order: index + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export const useReviews = () => {
  const { useStatic, snapshot, queryOptions } = usePublicQueryMode();

  return useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (useStatic && snapshot?.reviews.length) {
        return snapshot.reviews as Review[];
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("reviews")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        if (!data?.length) return mapLocalTestimonials();
        return data as Review[];
      } catch (err) {
        console.warn("Supabase reviews fetch failed. Falling back to local testimonials.");
        return mapLocalTestimonials();
      }
    },
    initialData: useStatic && snapshot?.reviews.length ? (snapshot.reviews as Review[]) : undefined,
    ...queryOptions,
  });
};
