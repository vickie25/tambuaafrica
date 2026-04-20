import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, posts as localPosts } from "@/data/blogPosts";

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

const mapRemoteBlogToUi = (item: any): BlogPost => {
  const parsed = extractMetaFromContent(item.content || "");
  const content = parsed.body;
  const excerpt =
    parsed.meta?.excerpt ||
    item.excerpt ||
    stripHtml(content).slice(0, 180) + (stripHtml(content).length > 180 ? "..." : "");
  const category =
    parsed.meta?.category ||
    item.category ||
    (Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : "Blog");
  const readTime = parsed.meta?.readTime || item.read_time || item.readTime || deriveReadTime(content);
  const date = parsed.meta?.date || formatBlogDate(item.date || item.created_at || item.updated_at);

  return {
    id: item.id,
    title: item.title || "Untitled Blog",
    excerpt,
    image: item.image || "/TRA.png",
    date,
    category,
    readTime,
    content,
  };
};

const mergeBlogsWithLocal = (remoteBlogs: BlogPost[]) => {
  const merged = [...localPosts];
  remoteBlogs.forEach((remoteBlog) => {
    const localIndex = merged.findIndex((item) => item.id === remoteBlog.id);
    if (localIndex >= 0) {
      merged[localIndex] = { ...merged[localIndex], ...remoteBlog };
      return;
    }
    merged.push(remoteBlog);
  });
  return merged;
};

export const useBlogs = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("blogs")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        if (!data || data.length === 0) {
          return localPosts;
        }

        const remoteBlogs = data.map((item) => mapRemoteBlogToUi(item)) as BlogPost[];

        return mergeBlogsWithLocal(remoteBlogs);
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to local blog posts.", err);
        return localPosts;
      }
    },
    initialData: localPosts,
    staleTime: 1000 * 60 * 5, // 5 mins - reduced from 30 mins for faster updates
    gcTime: 1000 * 60 * 30,   // 30 mins - reduced from 1 hour
    refetchOnWindowFocus: true, // Enable to show updates when switching tabs
  });

  // Real-time subscription for blogs - disabled due to subscription conflicts
  // TODO: Re-enable once Supabase realtime is properly configured
  /*
  useEffect(() => {
    const channel = supabase
      .channel('blogs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blogs'
        },
        (payload) => {
          console.log('Blogs real-time update:', payload);
          queryClient.invalidateQueries({ queryKey: ["blogs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  */

  return query;
};

export const useBlog = (id?: string) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("blogs")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;

        if (data) {
          return mapRemoteBlogToUi(data);
        }

        return localPosts.find((post) => post.id === id) || null;
      } catch (err) {
        console.warn(`Supabase fetch failed for blog post ${id}. Falling back to local post.`, err);
        return localPosts.find((post) => post.id === id) || null;
      }
    },
    enabled: !!id,
    initialData: () => (id ? localPosts.find((post) => post.id === id) || null : null),
    staleTime: 1000 * 60 * 5,
  });
};
