import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { motion, useReducedMotion } from "framer-motion";
import { useCarouselImages } from "@/hooks/useCarouselImages";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const STATS = [
  { value: "16+", label: "Years Experience" },
  { value: "500+", label: "Happy Clients" },
  { value: "50+", label: "Safari Packages" },
];

const HeroSection = () => {
  const { data: backgroundImages = [] } = useCarouselImages();
  const [currentImage, setCurrentImage] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (backgroundImages.length <= 1 || shouldReduceMotion) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [backgroundImages.length, shouldReduceMotion]);

  useEffect(() => {
    if (currentImage >= backgroundImages.length) setCurrentImage(0);
  }, [backgroundImages.length, currentImage]);

  const shouldRenderSlide = (index: number) => {
    if (backgroundImages.length <= 2) return true;
    const previous = (currentImage - 1 + backgroundImages.length) % backgroundImages.length;
    const next = (currentImage + 1) % backgroundImages.length;
    return index === currentImage || index === previous || index === next;
  };

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden bg-black">
      
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={image}
            initial={false}
            animate={{ opacity: shouldReduceMotion ? (index === 0 ? 1 : 0) : index === currentImage ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: "easeInOut" }}
            className="absolute inset-0 will-change-[opacity]"
          >
            {shouldRenderSlide(index) && (
              <OptimizedImage
                src={image}
                alt="Maasai Mara wildebeest migration Kenya safari landscape"
                fallbackSeed={`hero-${index}`}
                fallbackSrc={fallbackSafariImage(`hero-${index}`)}
                fill
                priority={index === 0}
                quality={90}
                width={1920}
                height={1080}
                sizes="100vw"
                className="scale-[1.03] motion-safe:animate-[kenBurns_14s_ease-in-out_infinite]"
              />
            )}
          </motion.div>
        ))}

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
      </div>

      {/* Slide indicators - top right */}
      {backgroundImages.length > 1 && (
        <div className="absolute top-32 right-8 z-10 hidden sm:flex flex-col gap-2">
          {backgroundImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`block rounded-full transition-all duration-300 cursor-pointer ${
                i === currentImage
                  ? "w-1.5 h-8 bg-white"
                  : "w-1.5 h-3 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-20 pb-20 sm:pb-24 lg:pb-32">
        <div className="max-w-4xl">
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-10 bg-accent" />
            <span className="font-sans text-[11px] uppercase tracking-[0.28em] text-white/80 font-semibold">
              Welcome to Tambua Africa
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display font-bold text-white leading-[1.0] mb-6"
            style={{ fontSize: "clamp(3.2rem, 8vw, 7rem)" }}
          >
            Kenya Safaris
            <br />
            <em className="not-italic text-accent" style={{ fontStyle: "italic" }}>& African Tours</em>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="font-sans text-white/75 text-lg leading-relaxed max-w-xl mb-10 font-light"
          >
            As a Nairobi tour operator, we craft tailor-made Kenya safaris, Maasai Mara packages, wildlife tours, beach holidays & cultural experiences across East Africa.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="btn-pill bg-accent text-white hover:bg-accent/90 px-9 py-7 text-base font-semibold shadow-xl shadow-accent/20 border-0 group"
            >
              <Link to="/safaris" className="inline-flex items-center gap-2">
                Explore Safaris
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="btn-pill border-white/30 text-white hover:bg-white/10 px-9 py-7 text-base bg-transparent font-medium backdrop-blur-sm"
            >
              <Link to="/about">Our Story</Link>
            </Button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex items-center gap-8 mt-14 pt-8 border-t border-white/15"
          >
            {STATS.map((stat, i) => (
              <div key={stat.label} className={`${i < STATS.length - 1 ? "pr-8 border-r border-white/15" : ""}`}>
                <div className="font-display font-bold text-white text-2xl sm:text-3xl leading-none">{stat.value}</div>
                <div className="font-sans text-white/55 text-xs uppercase tracking-[0.15em] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2">
        <span className="font-sans text-white/40 text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent">
          <div className="w-px bg-white/80 animate-[scrollIndicator_1.8s_ease-in-out_infinite]" style={{ height: "40%" }} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
