import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_STORAGE_BUCKET } from "./supabase-config";

/**
 * Fast image compression - skips heavy canvas processing
 * Just uploads the file directly if it's small, or does minimal resize
 */
export const compressImage = async (file: File, maxWidth = 1920, quality = 0.85): Promise<File> => {
  // If file is already small (< 500KB), skip compression entirely
  if (file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    // Short timeout - if it takes longer, just upload original
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      console.warn("Compression timeout, uploading original file");
      resolve(file); // Fall back to original file
    }, 8000);
    
    img.onload = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      
      // If image is already small enough, return as-is
      if (img.width <= maxWidth && file.size < 1024 * 1024) {
        resolve(file);
        return;
      }
      
      // Simple resize using canvas - lower quality for speed
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fall back to original
        return;
      }

      // Fast draw - lower quality setting
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fall back to original if compression didn't help
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fall back to original on error
    };
    
    img.src = objectUrl;
  });
};

/**
 * Creates a local blob URL for instant previewing
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Safely revokes a preview URL to prevent memory leaks
 */
export const revokePreviewUrl = (url: string) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Upload file to Supabase storage using the current authenticated session.
 */
export const uploadFileToSupabase = async (file: File, timeoutMs = 30000): Promise<string> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session) {
    throw new Error("You must sign in as an admin before uploading images.");
  }

  const extensionFromName = file.name.split(".").pop()?.toLowerCase();
  const extensionFromType = file.type.split("/").pop()?.toLowerCase();
  const fileExt = extensionFromName || extensionFromType || "bin";
  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "upload";
  const filePath = `${new Date().getUTCFullYear()}/${Date.now()}-${baseName}.${fileExt}`;

  const uploadPromise = supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Upload timed out. Check the storage bucket and your connection.")), timeoutMs);
  });

  const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as {
    data: { path: string } | null;
    error: { message: string } | null;
  };

  if (uploadResult.error) {
    throw new Error(uploadResult.error.message);
  }

  const { data } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(filePath);
  if (!data.publicUrl) {
    throw new Error("Upload succeeded, but no public URL was returned.");
  }

  return data.publicUrl;
};
