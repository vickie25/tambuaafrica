import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import OptimizedImage from "@/components/ui/optimized-image";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

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
  interval = 3200,
  align = "left",
}: HomeFeatureHeroProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const isLeft = align === "left";

  useEffect(() => {
    if (images.length <= 1 || shouldReduceMotion) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, Math.max(interval, 2800));
    return () => clearInterval(timer);
  }, [images, interval, shouldReduceMotion]);

  useEffect(() => {
    const preload = (src?: string) => {
      if (!src) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    };
    preload(images[0]);
    preload(images[1]);
  }, [images]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[min(85vh,48rem)] items-stretch overflow-hidden"
    >
      {/* Image Column */}
      <div
        className={`absolute inset-0 min-h-[min(85vh,48rem)] lg:relative lg:min-h-0 lg:flex-1 ${isLeft ? "lg:order-2" : "lg:order-1"}`}
      >
        {images.map((image, index) => (
          <motion.div
            key={image}
            initial={false}
            animate={{ opacity: shouldReduceMotion ? (index === 0 ? 1 : 0) : index === currentImage ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={image}
              alt={`${title} — image ${index + 1}`}
              fallbackSrc={fallbackSafariImage(`${title}-${index}`)}
              fill
              priority
              quality={82}
              rootMargin="800px"
            />
          </motion.div>
        ))}
        {/* Dark overlay for mobile legibility */}
        <div className="absolute inset-0 overlay-maroon-strong lg:hidden" />
        {/* Angled clip for desktop */}
        <div
          className={`absolute inset-y-0 hidden lg:block w-48 bg-card ${
            isLeft ? "right-0 bg-gradient-to-r from-transparent to-card" : "left-0 bg-gradient-to-l from-transparent to-card"
          }`}
          style={{
            clipPath: isLeft
              ? "polygon(40% 0%, 100% 0%, 100% 100%, 0% 100%)"
              : "polygon(0% 0%, 60% 0%, 100% 100%, 0% 100%)",
          }}
        />
      </div>

      {/* Content Column */}
      <div className={`relative z-10 flex lg:flex-1 items-center bg-card/0 lg:bg-card px-6 sm:px-10 lg:px-16 xl:px-20 py-24 lg:py-20 ${isLeft ? "lg:order-1" : "lg:order-2"}`}>
        <div className="max-w-md">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-8 bg-accent flex-shrink-0" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-accent lg:text-accent">
              {slogan}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display font-bold leading-tight text-white lg:text-foreground mb-5 text-balance"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.2rem)" }}
          >
            {title}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="section-lead text-white/75 lg:text-muted-foreground mb-8"
          >
            {description}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              asChild
              className="btn-pill bg-primary text-white hover:bg-primary/90 px-8 py-6 text-sm font-semibold group shadow-lg shadow-primary/20"
            >
              <Link to="/destinations" className="inline-flex items-center gap-2">
                Explore More
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Image dots indicator */}
          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex items-center gap-2 mt-8"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentImage ? "w-8 h-1.5 bg-accent" : "w-2 h-1.5 bg-accent/30 hover:bg-accent/60"
                  }`}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeFeatureHero;
