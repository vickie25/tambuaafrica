import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Info, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OptimizedImage from "@/components/ui/optimized-image";

interface HomeFeatureHeroProps {
  images: string[];
  slogan: string;
  title: string;
  description: string;
  interval?: number;
  align?: "left" | "right";
}

const HomeFeatureHero = ({
  images,
  slogan,
  title,
  description,
  interval = 4000,
  align = "left",
}: HomeFeatureHeroProps) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, Math.max(interval, 5000));
    return () => clearInterval(timer);
  }, [images, interval]);

  // Preload all images on mount
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  // Alternate background and content alignment
  const isLeft = align === "left";
  const sectionBg = isLeft
    ? "bg-gradient-to-b from-white/80 via-accent/10 to-white/60"
    : "bg-gradient-to-b from-accent/10 via-white/80 to-white/60";
  const borderClass = isLeft ? "border-t-4 border-accent" : "border-t-4 border-primary";
  const contentAlign = isLeft
    ? "absolute left-0 top-0 h-full flex flex-col justify-center items-start text-left max-w-xl w-full px-0 sm:px-2 lg:px-4 py-12 shadow-2xl border-r-8 border-accent"
    : "absolute right-0 top-0 h-full flex flex-col justify-center items-end text-right max-w-xl w-full px-0 sm:px-2 lg:px-4 py-12 shadow-2xl border-l-8 border-primary";

  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden ${borderClass} shadow-2xl ${sectionBg}`}>
      {/* Background Slideshow - Smooth crossfade */}
      <div className="absolute inset-0 z-0 bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={images[currentImage]}
              alt={`${title} background ${currentImage + 1}`}
              className="w-full h-full"
              quality={80}
              priority={false}
            />
          </motion.div>
        </AnimatePresence>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container-wide relative z-10 mx-auto flex w-full h-full">
        <div className={`${contentAlign} gap-2`}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 leading-tight">
            <span className="block text-yellow-400 font-semibold tracking-wider" style={{margin:isLeft?"0 0 0 -2px":"0 -2px 0 0",padding:isLeft?"0 0 0 8px":"0 8px 0 0"}}>{slogan}</span>
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-8 py-6 h-auto font-bold group"
            >
              <Link to="/destinations" className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Safari Destinations
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/30 text-white rounded-xl px-8 py-6 h-auto font-bold"
            >
              <Link to="/about" className="flex items-center">
                <Info className="w-5 h-5 mr-2" />
                About Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFeatureHero;
