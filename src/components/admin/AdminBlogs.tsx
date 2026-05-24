import { useState, memo } from "react";
import { useBlogs } from "@/hooks/useBlogs";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/supabase";
import { BlogPost, posts as starterPosts } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { AdminLocalImageUpload } from "@/components/admin/AdminLocalImageUpload";

type BlogInsert = Database["public"]["Tables"]["blogs"]["Insert"];

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const deriveReadTime = (content: string) => {
  const words = stripHtml(content).split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
};

const toIsoDate = (dateDisplay: string | undefined) => {
  if (!dateDisplay?.trim()) return new Date().toISOString().slice(0, 10);
  const d = new Date(dateDisplay);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

const emptyBlog: Partial<BlogPost> = {
  id: "",
  title: "",
  excerpt: "",
  image: "",
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  category: "",
  readTime: "",
  content: ""
};

export const AdminBlogs = () => {
  const { data: blogs = [], isLoading } = useBlogs({ includeDrafts: true });
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<"original" | "optimized">("original");
  const [blogStatus, setBlogStatus] = useState<"draft" | "published">("published");

  const handleEdit = (blog: BlogPost) => {
    setEditing(blog);
    setBlogStatus((blog.status as "draft" | "published") || "published");
  };

  const handleAdd = () => {
    setEditing({ ...emptyBlog, id: `blog-${Date.now()}` });
    setBlogStatus("draft");
  };

  const handleSeedStarterBlogs = async () => {
    setIsSubmitting(true);
    try {
      const payload: BlogInsert[] = starterPosts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        image: post.image,
        date: toIsoDate(post.date),
        category: post.category,
        read_time: post.readTime,
        content: post.content,
        status: "published",
      }));

      const { error } = await supabase.from("blogs").upsert(payload);
      if (error) throw error;

      toast.success("Starter blogs posted to database");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    } catch (error) {
      console.error("Seed blogs failed:", error);
      toast.error("Failed to post starter blogs");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setIsSubmitting(true);
    try {
      const normalizedCategory = (editing.category || "Blog").trim();
      const normalizedReadTime = (editing.readTime || "").trim();
      const contentHtml = (editing.content || "").trim();
      let excerptForDb = (editing.excerpt || "").trim();
      if (!excerptForDb) {
        const plain = stripHtml(contentHtml);
        excerptForDb = plain.slice(0, 180) + (plain.length > 180 ? "…" : "");
      }
      if (!excerptForDb.trim()) excerptForDb = " ";
      const readTimeForDb = normalizedReadTime || deriveReadTime(contentHtml);

      const payload: BlogInsert = {
        id: editing.id!,
        title: (editing.title || "").trim() || "Untitled",
        excerpt: excerptForDb,
        image: (editing.image || "").trim() || "/TRA.png",
        date: toIsoDate(editing.date),
        category: normalizedCategory,
        read_time: readTimeForDb,
        content: contentHtml || "<p></p>",
        status: blogStatus,
      };

      // Optimistic Update: Update the local cache immediately
      const previousData = queryClient.getQueryData(["blogs"]);
      queryClient.setQueryData(["blogs"], (old: BlogPost[] = []) => {
        const index = old.findIndex((b) => b.id === payload.id);
        const optimisticBlog = {
          id: payload.id!,
          title: payload.title || "",
          excerpt: excerptForDb,
          image: payload.image || "",
          date: editing.date || "",
          category: normalizedCategory,
          readTime: readTimeForDb,
          content: editing.content || "",
          status: blogStatus,
        } as BlogPost;
        if (index > -1) {
          const updated = [...old];
          updated[index] = optimisticBlog;
          return updated;
        }
        return [...old, optimisticBlog];
      });

      setEditing(null);

      // Perform the actual cloud save with a timeout
      const cloudSync = async () => {
        const { error } = await supabase.from("blogs").upsert(payload);
        if (error) throw error;
      };

      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Cloud Sync Timeout")), 20000)
      );

      try {
        await Promise.race([cloudSync(), timeout]);
        toast.success("Blog post saved to cloud");
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      } catch (error: unknown) {
        console.error("Cloud save failed:", error);
        // Revert optimistic update
        queryClient.setQueryData(["blogs"], previousData);
        const message = error instanceof Error ? error.message : "Unknown error";
        const msg =
          message === "Cloud Sync Timeout"
            ? "Cloud sync timed out. Data is saved locally but not in the database. Check your internet connection."
            : `Cloud save failed: ${message}. Ensure the blogs table matches the expected schema.`;
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
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Blog post deleted");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
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
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Blog</h2>
          <p className="mt-1 text-sm text-muted-foreground">Posts shown on /blog. Starter set is optional.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button type="button" variant="outline" onClick={handleSeedStarterBlogs} disabled={isSubmitting} className="shrink-0">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add starter posts
          </Button>
          <Button onClick={handleAdd} className="shrink-0 bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> New post
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Image</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <img src={blog.image} alt={blog.title} className="w-16 h-12 object-cover rounded-md" />
                  </td>
                  <td className="p-4 font-medium max-w-xs truncate">{blog.title}</td>
                  <td className="p-4">{blog.category}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (blog.status || "published") === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {(blog.status || "published") === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">{blog.date}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(blog as BlogPost)}><Edit className="w-4 h-4"/></Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.id)}><Trash2 className="w-4 h-4"/></Button>
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
            <DialogTitle>{editing?.id?.startsWith("blog-") ? "New post" : "Edit post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={editing?.title || ""} onChange={(e) => setEditing(prev => ({ ...prev!, title: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input value={editing?.category || ""} onChange={(e) => setEditing(prev => ({ ...prev!, category: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input value={editing?.date || ""} onChange={(e) => setEditing(prev => ({ ...prev!, date: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Read Time</label>
                <Input
                  value={editing?.readTime || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev!, readTime: e.target.value }))}
                  placeholder="Auto from content if empty"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={blogStatus} onValueChange={(v) => setBlogStatus(v as "draft" | "published")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea rows={3} value={editing?.excerpt || ""} onChange={(e) => setEditing(prev => ({ ...prev!, excerpt: e.target.value }))} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content (HTML)</label>
              <Textarea rows={8} value={editing?.content || ""} onChange={(e) => setEditing(prev => ({ ...prev!, content: e.target.value }))} required />
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
              <Input placeholder="Or paste image URL" value={editing?.image || ""} onChange={(e) => setEditing(prev => ({ ...prev!, image: e.target.value }))} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                {blogStatus === "published" ? "Save & Post" : "Save Draft"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(AdminBlogs);
