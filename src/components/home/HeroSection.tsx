import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";

const backgroundImages = [
  "/images/Wild beast migration 2.webp",
  "/images/maasai-mara-real.webp",
  "/images/Diani Beach (2).webp",
];

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {backgroundImages.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentImage ? "opacity-100 scale-100" : "opacity-0 scale-110"
          }`}
        >
          <OptimizedImage
            src={src}
            alt="Hero Background"
            className="w-full h-full object-cover"
            priority={index === 0}
            quality={90}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 text-left">
        <div className="max-w-4xl space-y-6 mt-16 sm:mt-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Explore <span className="font-display italic text-yellow-400">Africa</span> Through the
            Heart of the East
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
            Discover tailor-made adventures across Kenya, Tanzania, Uganda, Rwanda, and the Indian Ocean coast — from migration safaris to gorilla treks and beach escapes.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 rounded-xl font-semibold"
            >
              <Link to="/safaris">
                Explore Safaris <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 text-base px-8 py-6 rounded-xl bg-transparent"
            >
              <Play className="w-5 h-5 mr-2" /> Watch Our Story
            </Button>
          </div>

        </div>
      </div>

    </section>
  );
};

export default HeroSection;
