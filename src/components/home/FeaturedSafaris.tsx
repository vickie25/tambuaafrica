import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafaris } from "@/hooks/useSafaris";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import BookingModal from "@/components/booking/BookingModal";
import OptimizedImage from "@/components/ui/optimized-image";

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
    <section className="section-padding bg-background" ref={ref}>
      <div className="container-wide mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Packages</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">Featured Safaris</h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Handpicked safari packages designed to give you the ultimate African adventure.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl shrink-0">
            <Link to="/safaris">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          {isLoading ? null : safaris.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Safari packages will appear here once they are published in your catalogue.
            </p>
          ) : (
            safaris.slice(0, 6).map((safari, index) => (
              <div
              key={safari.id}
              className={`group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link to={`/safaris/${safari.id}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <OptimizedImage 
                    src={safari.image} 
                    alt={safari.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              </Link>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-accent text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{safari.rating}</span>
                    <span className="text-muted-foreground">({safari.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3.5 h-3.5" />{safari.duration}
                  </div>
                </div>
                <Link to={`/safaris/${safari.id}`}>
                  <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{safari.title}</h3>
                </Link>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />{safari.location}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">From</span>
                    <span className="text-xl font-bold text-primary ml-1">${safari.price}</span>
                    <span className="text-xs text-muted-foreground">/person</span>
                  </div>
                  <Button size="sm" onClick={() => handleBook(safari.id)} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} preselectedSafari={selectedSafari} />
    </section>
  );
};

export default FeaturedSafaris;
