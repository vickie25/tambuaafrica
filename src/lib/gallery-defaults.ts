import { encodePublicImageSrc, normalizePublicImagePath } from "@/lib/public-image-path";

export type GalleryPhoto = {
  src: string;
  alt: string;
  category: string;
};

const galleryPhotoKey = (src: string) => normalizePublicImagePath(src).toLowerCase();

export const isValidGallerySrc = (src: string | null | undefined): boolean => {
  const trimmed = (src || "").trim();
  if (!trimmed || trimmed.startsWith("blob:")) return false;
  return true;
};

/** Built-in /gallery photos shipped with the site (public folder). */
export const DEFAULT_GALLERY_FOLDER_IMAGES = [
  "/images/real images frm Tambua/at MAasai mara.jpeg",
  "/images/real images frm Tambua/DR. Amos Shibale from Seattle USA.jpeg",
  "/images/real images frm Tambua/A drive.jpeg",
  "/images/real images frm Tambua/Maasai Culture.jpeg",
  "/images/real images frm Tambua/Dr. Palca  Shibale from Seattle USa.jpeg",
  "/images/real images frm Tambua/Tourists at Nairobi park.jpeg",
  "/images/real images frm Tambua/Tourists with the team at the park.jpeg",
  "/images/real images frm Tambua/lion at Nairobi park.jpeg",
  "/images/real images frm Tambua/Nairobi park.jpeg",
  "/images/real images frm Tambua/safari vehicle.jpeg",
  "/images/real images frm Tambua/Team Bonding with Maasai Culture.jpeg",
  "/images/real images frm Tambua/team outside.jpeg",
  "/images/real images frm Tambua/Lion spotting.jpeg",
  "/images/real images frm Tambua/Tourist learning about the culture.jpeg",
  "/images/real images frm Tambua/Team.jpeg",
  "/images/real images frm Tambua/Zebra at Nairobi park.jpeg",
  "/images/real images frm Tambua/hotel.jpeg",
  "/images/real images frm Tambua/A snap with tourist.jpeg",
  "/images/real images frm Tambua/Tourist happy with Tambua africa Services.jpeg",
  "/images/real images frm Tambua/Drive Vehicle.jpeg",
  "/images/real images frm Tambua/Drive at the park.jpeg",
  "/images/real images frm Tambua/ready for the tour.jpeg",
  "/images/real images frm Tambua/St the park drive.jpeg",
  "/images/real images frm Tambua/Tambua Africa safari vehicle.jpeg",
  "/images/real images frm Tambua/Mrs Odilliah Sagali from Seattle USA.jpeg",
  "/images/real images frm Tambua/the safari.jpeg",
  "/images/real images frm Tambua/Eng. Briscan Shibale from Seattle USA.jpeg",
] as const;

export const defaultGalleryId = (index: number) => `gallery-default-${index}`;

/** DB rows + built-in folder photos, normalized, deduped, invalid URLs removed. */
export const buildGalleryPhotoList = (
  dbItems: GalleryPhoto[],
  options?: { includeDefaults?: boolean },
): GalleryPhoto[] => {
  const includeDefaults = options?.includeDefaults !== false;
  const seen = new Set<string>();
  const merged: GalleryPhoto[] = [];

  const push = (item: GalleryPhoto) => {
    if (!isValidGallerySrc(item.src)) return;
    const normalized = normalizePublicImagePath(item.src);
    if (!normalized) return;
    const key = galleryPhotoKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push({
      ...item,
      src: normalized,
    });
  };

  for (const item of dbItems) {
    push(item);
  }

  if (includeDefaults) {
    DEFAULT_GALLERY_FOLDER_IMAGES.forEach((src, index) => {
      push({
        src,
        alt: `Tambua Gallery ${index + 1}`,
        category: "Gallery",
      });
    });
  }

  return merged;
};

/** @deprecated Use buildGalleryPhotoList */
export const mergeGalleryWithDefaults = <T extends GalleryPhoto>(dbItems: T[]): T[] =>
  buildGalleryPhotoList(dbItems) as T[];

export const galleryImageSrc = (src: string) => encodePublicImageSrc(src);
