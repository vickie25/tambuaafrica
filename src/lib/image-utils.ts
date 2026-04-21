import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_STORAGE_BUCKET, SUPABASE_STORAGE_BUCKET_FALLBACKS } from "./supabase-config";

/**
 * High-quality image optimization.
 * Preserve source format and skip re-encoding unless the image is very large.
 */
export const compressImage = async (file: File, maxWidth = 3840, quality = 0.92): Promise<File> => {
  // Keep original file for normal upload sizes to avoid quality loss.
  if (file.size < 4 * 1024 * 1024) {
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
      
      // If image dimensions are already reasonable, keep source intact.
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }
      
      // Resize only when extremely wide, while preserving image type when possible.
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

      ctx.drawImage(img, 0, 0, width, height);

      const sourceMime = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
      const targetMime = sourceMime === "image/gif" ? "image/png" : sourceMime;
      const outputExtMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
        "image/bmp": "bmp",
      };
      const outputExt = outputExtMap[targetMime] || "jpg";

      canvas.toBlob(
        (blob) => {
          // Only replace when optimization provides meaningful savings.
          if (blob && blob.size < file.size * 0.9) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + `.${outputExt}`, {
              type: targetMime,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fall back to original if compression didn't help
          }
        },
        targetMime,
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

  const bucketsToTry = [
    SUPABASE_STORAGE_BUCKET,
    ...SUPABASE_STORAGE_BUCKET_FALLBACKS,
  ].filter((bucket, idx, arr) => Boolean(bucket) && arr.indexOf(bucket) === idx);

  let lastError = "Unknown upload error";

  for (const bucket of bucketsToTry) {
    const uploadPromise = supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Upload timed out for bucket '${bucket}'.`)),
        timeoutMs
      );
    });

    try {
      const uploadResult = (await Promise.race([uploadPromise, timeoutPromise])) as {
        data: { path: string } | null;
        error: { message: string } | null;
      };

      if (uploadResult.error) {
        lastError = uploadResult.error.message;
        continue;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (!data.publicUrl) {
        lastError = `Upload succeeded in '${bucket}', but no public URL was returned.`;
        continue;
      }

      return data.publicUrl;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(
    `Upload failed across configured buckets (${bucketsToTry.join(", ")}): ${lastError}`
  );
};
