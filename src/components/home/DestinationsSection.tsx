import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { encodePublicImageSrc } from "@/lib/public-image-path";

const destinations = [
  {
    id: "masai-mara",
    title: "Maasai Mara",
    country: "Kenya",
    image: "/images/real images frm Tambua/at MAasai mara.jpeg",
    size: "large",
  },
  {
    id: "serengeti",
    title: "Serengeti",
    country: "Tanzania",
    image: "/images/real images frm Tambua/the safari.jpeg",
    size: "small",
  },
  {
    id: "amboseli",
    title: "Amboseli",
    country: "Kenya",
    image: "/images/amboseli-real.webp",
    size: "small",
  },
  {
    id: "ngorongoro",
    title: "Ngorongoro",
    country: "Tanzania",
    image: "/images/real images frm Tambua/Tourist learning about the culture.jpeg",
    size: "large",
  },
];

const DestinationsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-card" ref={ref}>
      <div className="container-wide mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-px w-8 bg-accent flex-shrink-0" />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
                Iconic Locations
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-bold text-foreground leading-tight mb-4"
              style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
            >
              Explore East Africa
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="section-lead"
            >
              From the endless plains of the Serengeti to the shadow of Mount Kilimanjaro, discover the most spectacular wilderness areas on earth.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Button asChild variant="outline" className="btn-pill hidden md:inline-flex bg-transparent border-primary/20 text-primary hover:bg-primary/5">
              <Link to="/destinations" className="group">
                All Destinations <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 min-h-[600px] lg:min-h-[700px]">
          {destinations.map((dest, index) => {
            const isLarge = dest.size === "large";
            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 * index }}
                className={`relative group rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                  isLarge ? "md:col-span-2" : "md:col-span-1"
                } ${index === 1 || index === 2 ? "h-[300px] md:h-auto" : "h-[400px] md:h-auto"}`}
              >
                <Link to={`/destinations/${dest.id}`} className="block w-full h-full">
                  <img
                    src={encodePublicImageSrc(dest.image)}
                    alt={dest.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 p-8 sm:p-10 w-full">
                    <div className="flex items-center gap-2 mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span className="font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-white/90">
                        {dest.country}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      {dest.title}
                    </h3>
                    
                    {/* Discover line - reveals on hover */}
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-150">
                        <span className="font-sans text-sm font-medium">Discover Region</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center md:hidden">
          <Button asChild variant="outline" className="btn-pill w-full max-w-sm border-primary/20 text-primary">
            <Link to="/destinations">All Destinations</Link>
          </Button>
        </div>

      </div>
    </section>
  );
};

export default DestinationsSection;
