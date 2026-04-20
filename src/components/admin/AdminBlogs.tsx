import { useState, memo, type ChangeEvent } from "react";
import { useBlogs } from "@/hooks/useBlogs";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { compressImage, createPreviewUrl, uploadFileToSupabase } from "@/lib/image-utils";

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
  const { data: blogs = [], isLoading } = useBlogs();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"processing" | "uploading" | null>(null);

  const handleEdit = (blog: BlogPost) => setEditing(blog);

  const handleAdd = () => {
    setEditing({ ...emptyBlog, id: `blog-${Date.now()}` });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show instant local preview
    const previewUrl = createPreviewUrl(file);
    const previousImage = editing?.image;
    setEditing((prev) => prev ? { ...prev, image: previewUrl } : null);

    setUploading(true);
    setUploadStatus("processing");
    try {
      // 2. Optimized compression
      const compressedFile = await compressImage(file);

      setUploadStatus("uploading");
      // 3. Optimized upload
      const publicUrl = await uploadFileToSupabase(compressedFile);

      // 4. Final URL update
      setEditing((prev) => prev ? { ...prev, image: publicUrl } : null);
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      // Revert to previous image
      setEditing((prev) => prev ? { ...prev, image: previousImage } : null);
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setIsSubmitting(true);
    try {
      const normalizedCategory = (editing.category || "Blog").trim();
      const normalizedReadTime = (editing.readTime || "").trim();
      const metadataPrefix = `<!--meta:${JSON.stringify({
        excerpt: editing.excerpt || "",
        category: normalizedCategory,
        readTime: normalizedReadTime,
        date: editing.date || "",
      })}-->`;

      const payload = {
        id: editing.id,
        title: editing.title,
        image: editing.image,
        content: `${metadataPrefix}\n${editing.content || ""}`,
        author: "Tambua Africa",
        published: true,
        tags: [normalizedCategory].filter(Boolean),
      };

      // Optimistic Update: Update the local cache immediately
      const previousData = queryClient.getQueryData(["blogs"]);
      queryClient.setQueryData(["blogs"], (old: BlogPost[] = []) => {
        const index = old.findIndex((b) => b.id === payload.id);
        const optimisticBlog = {
          id: payload.id!,
          title: payload.title || "",
          excerpt: editing.excerpt || "",
          image: payload.image || "",
          date: editing.date || "",
          category: normalizedCategory,
          readTime: normalizedReadTime || "1 min read",
          content: editing.content || "",
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("blogs").upsert(payload);
        if (error) throw error;
      };

      const timeout = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Cloud Sync Timeout")), 20000)
      );

      try {
        await Promise.race([cloudSync(), timeout]);
        toast.success("Blog post saved to cloud");
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      } catch (error: any) {
        console.error("Cloud save failed:", error);
        // Revert optimistic update
        queryClient.setQueryData(["blogs"], previousData);
        const msg = error.message === "Cloud Sync Timeout" 
          ? "Cloud sync timed out. Data is saved locally but not in the database. Check your internet connection." 
          : `Cloud save failed: ${error.message}. Ensure you ran the SQL script in Supabase.`;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("blogs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Blog post deleted");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-accent"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl font-bold">Manage Blog Posts</h2>
          <p className="text-muted-foreground text-sm">Add, edit, or remove blog posts.</p>
        </div>
        <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90"><Plus className="w-4 h-4 mr-2"/> Add Blog Post</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Image</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
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
            <DialogTitle>{editing?.id?.startsWith("blog-") ? "Add New Blog Post" : "Edit Blog Post"}</DialogTitle>
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
                <Input value={editing?.readTime || ""} onChange={(e) => setEditing(prev => ({ ...prev!, readTime: e.target.value }))} required />
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
              <label className="text-sm font-medium">Cover Image</label>
              <div className="flex items-center gap-4">
                {editing?.image && <img src={editing.image} alt="Preview" className="w-16 h-16 rounded object-cover" />}
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  {uploading && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin"/> 
                      {uploadStatus === "processing" ? "Optimizing image..." : "Uploading to cloud..."}
                    </p>
                  )}
                </div>
              </div>
              <Input placeholder="Or paste image URL" value={editing?.image || ""} onChange={(e) => setEditing(prev => ({ ...prev!, image: e.target.value }))} className="mt-2" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting || uploading}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default memo(AdminBlogs);