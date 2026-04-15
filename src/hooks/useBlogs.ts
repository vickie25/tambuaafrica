import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, posts as localPosts } from "@/data/blogPosts";

export const useBlogs = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      try {
        const fetchBlogs = async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from("blogs")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data;
        };

        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Supabase Timeout")), 5000));
        const data = await Promise.race([fetchBlogs(), timeout]);

        if (!data || data.length === 0) {
          return localPosts;
        }

        return data.map((item) => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt,
          image: item.image,
          date: item.date || item.created_at || "",
          category: item.category,
          readTime: item.read_time || item.readTime || "",
          content: item.content,
        })) as BlogPost[];
      } catch (err) {
        console.warn("Supabase fetch failed or timed out. Falling back to local blog posts.", err);
        return localPosts;
      }
    },
    initialData: localPosts,
    staleTime: 1000 * 60 * 5, // 5 mins - reduced from 30 mins for faster updates
    gcTime: 1000 * 60 * 30,   // 30 mins - reduced from 1 hour
    refetchOnWindowFocus: true, // Enable to show updates when switching tabs
  });

  // Real-time subscription for blogs
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

  return query;
};

export const useBlog = (id?: string) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const fetchBlog = async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from("blogs")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (error) throw error;
          return data;
        };

        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Supabase Timeout")), 5000));
        const data = await Promise.race([fetchBlog(), timeout]);

        if (data) {
          return {
            id: data.id,
            title: data.title,
            excerpt: data.excerpt,
            image: data.image,
            date: data.date || data.created_at || "",
            category: data.category,
            readTime: data.read_time || data.readTime || "",
            content: data.content,
          } as BlogPost;
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
