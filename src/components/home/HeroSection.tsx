import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { motion, useReducedMotion } from "framer-motion";
import { useCarouselImages } from "@/hooks/useCarouselImages";

const HeroSection = () => {
  const { data: backgroundImages = [] } = useCarouselImages();
  const [currentImage, setCurrentImage] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (backgroundImages.length <= 1 || shouldReduceMotion) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [backgroundImages.length, shouldReduceMotion]);

  // Warm up only the first frame and immediate next frame.
  // Preloading every slide at once can delay first paint on slower networks.
  useEffect(() => {
    if (backgroundImages.length === 0) return;
    const preload = (src?: string) => {
      if (!src) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    };
    preload(backgroundImages[0]);
    preload(backgroundImages[1]);
  }, [backgroundImages]);

  useEffect(() => {
    if (currentImage >= backgroundImages.length) {
      setCurrentImage(0);
    }
  }, [backgroundImages.length, currentImage]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Keep slides mounted and only animate opacity for smoother transitions */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={image}
            initial={false}
            animate={{ opacity: shouldReduceMotion ? (index === 0 ? 1 : 0) : index === currentImage ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "linear" }}
            className="absolute inset-0 will-change-[opacity]"
          >
            <OptimizedImage
              src={image}
              alt="Maasai Mara wildebeest migration Kenya safari landscape"
              className="w-full h-full object-cover"
              priority
              quality={85}
              width={1920}
              height={1080}
            />
          </motion.div>
        ))}
      </div>

      {/* Light gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 text-left">
        <div className="max-w-4xl space-y-6 mt-16 sm:mt-0">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
          >
            Kenya Safaris &amp; African Tours | Tambua Africa Tours and Safaris
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed"
          >
            As a Nairobi tour operator, we craft tailor-made Kenya safaris, affordable Maasai Mara packages, wildlife tours, beach holidays, and cultural experiences across East Africa.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-row flex-wrap items-center justify-start gap-3 pt-4"
          >
            <Button
              asChild
              size="lg"
              className="min-w-0 flex-1 sm:flex-initial sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-base px-6 py-6 sm:px-8 rounded-xl font-semibold transition-transform hover:scale-105 active:scale-95"
            >
              <Link to="/safaris">
                Explore Safaris <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-0 flex-1 sm:flex-initial sm:w-auto border-white/30 text-white hover:bg-white/10 text-base px-6 py-6 sm:px-8 rounded-xl bg-transparent transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 mr-2" /> Watch Our Story
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
