import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/supabase";
import { BlogPost, posts as localPosts } from "@/data/blogPosts";

type BlogRow = Database["public"]["Tables"]["blogs"]["Row"];

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const deriveReadTime = (content: string) => {
  const words = stripHtml(content).split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
};

const extractMetaFromContent = (content: string) => {
  const match = content.match(/^<!--meta:(\{[\s\S]*?\})-->\s*/);
  if (!match) {
    return { meta: null as null | Record<string, string>, body: content };
  }

  try {
    const parsed = JSON.parse(match[1]) as Record<string, string>;
    return { meta: parsed, body: content.replace(match[0], "") };
  } catch {
    return { meta: null as null | Record<string, string>, body: content };
  }
};

const formatBlogDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const mapRemoteBlogToUi = (item: BlogRow & { tags?: string[]; author?: string }): BlogPost => {
  const parsed = extractMetaFromContent(item.content || "");
  const content = parsed.body;
  const excerpt =
    (item.excerpt && item.excerpt.trim()) ||
    parsed.meta?.excerpt ||
    stripHtml(content).slice(0, 180) + (stripHtml(content).length > 180 ? "..." : "");
  const category =
    (item.category && item.category.trim()) ||
    parsed.meta?.category ||
    (Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : "Blog");
  const readTime =
    (item.read_time && item.read_time.trim()) ||
    parsed.meta?.readTime ||
    deriveReadTime(content);
  const date =
    (item.date && item.date.trim() && formatBlogDate(item.date)) ||
    parsed.meta?.date ||
    formatBlogDate(item.created_at || item.updated_at);

  return {
    id: item.id,
    title: item.title || "Untitled Blog",
    excerpt,
    image: item.image || "/TRA.png",
    date,
    category,
    readTime,
    content,
    status: ((item as { status?: string }).status as "draft" | "published" | undefined) || "published",
  };
};

export const useBlogs = ({ includeDrafts = false }: { includeDrafts?: boolean } = {}) => {
  const query = useQuery({
    queryKey: ["blogs", includeDrafts ? "all" : "published"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
        if (error) throw error;

        if (!data || data.length === 0) {
          return includeDrafts ? localPosts : localPosts.filter((post) => (post.status || "published") === "published");
        }

        const mapped = data.map((item) => mapRemoteBlogToUi(item as BlogRow & { tags?: string[] }));
        return includeDrafts ? mapped : mapped.filter((post) => (post.status || "published") === "published");
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to local blog posts.", err);
        return includeDrafts ? localPosts : localPosts.filter((post) => (post.status || "published") === "published");
      }
    },
    staleTime: 1000 * 60 * 5, // 5 mins - reduced from 30 mins for faster updates
    gcTime: 1000 * 60 * 30,   // 30 mins - reduced from 1 hour
    refetchOnWindowFocus: true, // Enable to show updates when switching tabs
  });

  return query;
};

export const useBlog = (id?: string, { includeDrafts = false }: { includeDrafts?: boolean } = {}) => {
  return useQuery({
    queryKey: ["blog", id, includeDrafts ? "all" : "published"],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data, error } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
        if (error) throw error;

        if (data) {
          const mapped = mapRemoteBlogToUi(data as BlogRow & { tags?: string[] });
          if (!includeDrafts && (mapped.status || "published") !== "published") return null;
          return mapped;
        }

        return null;
      } catch (err) {
        console.warn(`Supabase fetch failed for blog post ${id}. Falling back to local post.`, err);
        return localPosts.find((post) => post.id === id) || null;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
