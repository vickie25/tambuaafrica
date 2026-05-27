import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";
import { useCarouselImageItems } from "@/hooks/useCarouselImages";
import { buildGalleryPhotoList, galleryImageSrc } from "@/lib/gallery-defaults";
import PageHero from "@/components/layout/PageHero";

const Gallery = () => {
  const { data: adminGallery = [] } = useCarouselImageItems("gallery");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const dbPhotos = [...adminGallery]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      src: item.url,
      alt: item.title || "Tambua Gallery Image",
      category: "Gallery",
    }));

  const photos = buildGalleryPhotoList(dbPhotos);

  const filtered = photos;

  const navigateLightbox = (dir: 1 | -1) => {
    if (lightbox === null) return;
    setLightbox((lightbox + dir + filtered.length) % filtered.length);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <PageHero
          eyebrow="Gallery"
          title="Safari Moments"
          description="A glimpse into the breathtaking experiences that await you across Kenya."
          imageSrc="/images/real images frm Tambua/Team Bonding with Maasai Culture.jpeg"
          imageAlt="Maasai cultural experience on safari"
          fallbackSrc={fallbackSafariImage("gallery-hero")}
        />

        <section className="section-padding bg-background">
          <div className="container-wide mx-auto">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map((photo, i) => (
                <motion.div
                  key={`${galleryImageSrc(photo.src)}-${i}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                  className="break-inside-avoid cursor-pointer group"
                  onClick={() => setLightbox(i)}
                >
                  <div className="surface-card-interactive relative overflow-hidden">
                    <OptimizedImage
                      src={photo.src}
                      fallbackSrc={fallbackSafariImage(`gallery-tile-${i}`)}
                      alt={photo.alt}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                      <span className="text-white text-sm font-medium p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.alt}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Lightbox with navigation */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white z-10" onClick={() => setLightbox(null)}>
              <X className="w-8 h-8" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.img
              key={galleryImageSrc(filtered[lightbox].src)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={galleryImageSrc(filtered[lightbox].src)}
              alt={filtered[lightbox].alt}
              className="max-w-full max-h-[85vh] object-contain rounded-none shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 text-white/70 text-sm">
              {lightbox + 1} / {filtered.length}: {filtered[lightbox].alt}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
