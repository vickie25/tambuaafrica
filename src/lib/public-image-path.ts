/**
 * Normalize local `/images/...` paths so they match files in `public/images`.
 * Fixes folder typos, URL-encoding, and legacy Supabase storage keys.
 */
export function normalizePublicImagePath(src: string | null | undefined): string {
  if (!src) return "";
  let path = src.trim().replace(/\\/g, "/");
  if (!path) return "";

  if (path.includes("supabase.co/storage") && path.includes("public%5Cimages")) {
    try {
      const u = new URL(path);
      const last = decodeURIComponent(u.pathname.split("/").pop() || "");
      const match = last.match(/images[\\/]destiations[\\/](.+)$/i);
      if (match) {
        path = `/images/destiations/${match[1].replace(/\\/g, "/")}`;
      }
    } catch {
      /* keep original */
    }
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const u = new URL(path);
      const host = u.hostname.replace(/^www\./i, "").toLowerCase();
      const isThisSite =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "tambuaafrica.com" ||
        host === "tambua-africa.com" ||
        host.endsWith(".vercel.app");
      if (isThisSite && u.pathname.startsWith("/images/")) {
        let local = u.pathname;
        try {
          local = decodeURI(local);
        } catch {
          /* keep */
        }
        return local;
      }
    } catch {
      /* keep full URL */
    }
    return path;
  }

  if (path.startsWith("/images/") || path.startsWith("/")) {
    try {
      path = decodeURI(path);
    } catch {
      /* keep */
    }
  }

  path = path.replace("/images/destinations/", "/images/destiations/");

  const exact: Record<string, string> = {
    "/images/dawn-w-FmUx8z_Tz4A-unsplash.webp": "/images/destiations/Lake Nakuru/lake elementaita.webp",
    "/images/destiations/Lake Naivash/Sopa boat rides.webp":
      "/images/destiations/Lake Naivasha/Sopa boat rides.webp",
    "/images/destiations/Lake Naivasha/lake elementaita.webp":
      "/images/destiations/Lake Nakuru/lake elementaita.webp",
    "/images/real images frm Tambua/Mara.jpeg": "/images/real images frm Tambua/at MAasai mara.jpeg",
    "/images/real images frm Tambua/serengenti.jpeg": "/images/real images frm Tambua/the safari.jpeg",
    "/images/real images frm Tambua/Elephant.jpeg": "/images/amboseli-real.webp",
    "/images/real images frm Tambua/Tanzania.jpeg":
      "/images/real images frm Tambua/Tourist learning about the culture.jpeg",
    "/images/real images frm Tambua/Diani.jpeg": "/images/diani.webp",
    "/images/real images frm Tambua/kilimajaro.webp": "/images/mount-kenya.webp",
    "/images/real images frm Tambua/Masai.webp": "/images/real images frm Tambua/Maasai Culture.jpeg",
    "/images/real images frm Tambua/balooon.webp": "/images/Wild beast migration 2.webp",
    "/images/real images frm Tambua/Lion.jpeg": "/images/real images frm Tambua/Lion spotting.jpeg",
  };

  if (exact[path]) return exact[path];

  if (path.includes("/destiations/Lake Naivash/")) {
    return path.replace("/destiations/Lake Naivash/", "/destiations/Lake Naivasha/");
  }

  return path;
}

/** Encode a site-root path for use in img src (decode first to avoid double-encoding). */
export function encodePublicImageSrc(src: string): string {
  const normalized = normalizePublicImagePath(src);
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  return encodeURI(normalized);
}
