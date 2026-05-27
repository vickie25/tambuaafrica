import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafaris } from "@/hooks/useSafaris";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import BookingModal from "@/components/booking/BookingModal";
import OptimizedImage from "@/components/ui/optimized-image";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const FeaturedSafaris = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSafari, setSelectedSafari] = useState("");

  const handleBook = (safariId: string) => {
    setSelectedSafari(safariId);
    setBookingOpen(true);
  };

  const { data: safaris = [], isLoading } = useSafaris();

  return (
    <section className="section-padding bg-secondary/30" ref={ref}>
      <div className="container-wide mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-accent flex-shrink-0" />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
                Curated Journeys
              </span>
            </div>
            <h2 className="section-title mb-4">Featured Safaris</h2>
            <p className="section-lead">
              Handpicked itineraries designed to immerse you in the breathtaking beauty and untamed wilderness of Africa.
            </p>
          </div>
          <Button asChild variant="outline" className="btn-pill shrink-0 hidden md:inline-flex bg-transparent border-primary/20 hover:bg-primary/5 text-primary">
            <Link to="/safaris" className="group">
              View All Packages <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
          {isLoading ? null : safaris.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-lg text-muted-foreground font-sans">
                Curating our exclusive packages...
              </p>
            </div>
          ) : (
            safaris.slice(0, 6).map((safari, index) => (
              <div
                key={safari.id}
                className={`group bg-card rounded-[2rem] overflow-hidden border border-border/40 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col ${
                  isVisible ? "animate-fade-up visible" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Image Container */}
                <Link to={`/safaris/${safari.id}`} className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden block">
                  <OptimizedImage 
                    src={safari.image}
                    fallbackSrc={fallbackSafariImage(safari.id)}
                    alt={safari.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Floating Tags */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="glass-light backdrop-blur-md bg-white/90 text-foreground px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {safari.duration}
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6 sm:p-8 flex flex-col flex-grow bg-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-bold text-sm font-sans text-foreground">{safari.rating}</span>
                      <span className="text-muted-foreground text-sm font-sans">({safari.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-sans truncate">
                      <MapPin className="w-4 h-4 shrink-0 text-primary/60" />
                      <span className="truncate">{safari.location}</span>
                    </div>
                  </div>

                  <Link to={`/safaris/${safari.id}`} className="mb-6 block group-hover:text-primary transition-colors">
                    <h3 className="font-display font-bold text-2xl leading-tight line-clamp-2">
                      {safari.title}
                    </h3>
                  </Link>

                  <div className="mt-auto pt-6 border-t border-border/60 flex items-end justify-between">
                    <div>
                      <span className="block text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-1">Starting From</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display font-bold text-2xl sm:text-3xl text-primary">${safari.price}</span>
                        <span className="text-sm text-muted-foreground font-sans">/pp</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleBook(safari.id)}
                      className="btn-pill bg-accent hover:bg-accent/90 text-white px-6 py-5 shadow-lg shadow-accent/20"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile View All CTA */}
        <div className="mt-10 flex justify-center md:hidden">
          <Button asChild variant="outline" className="btn-pill bg-transparent border-primary/20 text-primary w-full max-w-sm">
            <Link to="/safaris">View All Packages</Link>
          </Button>
        </div>

      </div>
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} preselectedSafari={selectedSafari} />
    </section>
  );
};

export default FeaturedSafaris;
