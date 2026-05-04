import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";
import { useCarouselImageItems } from "@/hooks/useCarouselImages";

const folderGalleryImages = [
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

const Gallery = () => {
  const { data: adminGallery = [] } = useCarouselImageItems("gallery");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos =
    adminGallery.length > 0
      ? adminGallery.map((item) => ({
          src: item.url,
          alt: item.title || "Tambua Gallery Image",
          category: "Gallery",
        }))
      : folderGalleryImages.map((src, index) => ({
          src,
          alt: `Tambua Gallery ${index + 1}`,
          category: "Gallery",
        }));

  const filtered = photos;

  const navigateLightbox = (dir: 1 | -1) => {
    if (lightbox === null) return;
    setLightbox((lightbox + dir + filtered.length) % filtered.length);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 z-0 opacity-20">
            <OptimizedImage
              src="/images/real images frm Tambua/Team Bonding with Maasai Culture.jpeg"
              fallbackSrc={fallbackSafariImage("gallery-hero")}
              alt="Gallery Background"
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="container-wide relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Gallery</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3">Safari Moments</h1>
            <p className="text-primary-foreground/70 mt-4 max-w-2xl mx-auto text-lg">
              A glimpse into the breathtaking experiences that await you across Kenya.
            </p>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-wide mx-auto">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map((photo, i) => (
                <motion.div
                  key={photo.src}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                  className="break-inside-avoid cursor-pointer group"
                  onClick={() => setLightbox(i)}
                >
                  <div className="relative rounded-2xl overflow-hidden">
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
              key={filtered[lightbox].src}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={filtered[lightbox].src}
              alt={filtered[lightbox].alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
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
