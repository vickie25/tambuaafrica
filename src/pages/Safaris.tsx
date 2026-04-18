import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { useSafaris } from "@/hooks/useSafaris";
import BookingModal from "@/components/booking/BookingModal";
import { Star, MapPin, Clock, Filter, Loader2 } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["All", "Wildlife Safari", "Beach Holiday", "Cultural Tour", "Adventure"];

// Skeleton loader for safari cards
const SafariSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border">
    <div className="aspect-[16/10]">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

const Safaris = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSafari, setSelectedSafari] = useState("");
  const { data: safaris = [], isLoading } = useSafaris();

  const filtered = activeCategory === "All" ? safaris : safaris.filter((s) => s.category === activeCategory);

  const handleBook = (safariId: string) => {
    setSelectedSafari(safariId);
    setBookingOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-primary text-primary-foreground">
            <div className="absolute inset-0 z-0 opacity-20">
              <OptimizedImage 
                src="/images/amboseli-real.webp" 
                alt="Safaris Background" 
                className="w-full h-full object-cover"
                priority 
              />
            </div>
            <div className="container-wide relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Packages</span>
              <h1 className="text-4xl sm:text-5xl font-bold mt-3">Safari Packages</h1>
              <p className="text-primary-foreground/70 mt-4 max-w-2xl mx-auto text-lg">
                Choose from our curated selection of safari experiences across Kenya.
              </p>
            </div>
          </section>

          <section className="section-padding bg-background">
            <div className="container-wide mx-auto">
              <div className="flex items-center gap-2 mb-8 flex-wrap">
                <Filter className="w-5 h-5 text-muted-foreground" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <>
                    <SafariSkeleton />
                    <SafariSkeleton />
                    <SafariSkeleton />
                  </>
                ) : (
                  filtered.map((safari, index) => (
                    <div
                      key={safari.id}
                      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-500"
                    >
                    <Link to={`/safaris/${safari.id}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <OptimizedImage
                          src={safari.image}
                          alt={safari.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          width={800}
                          height={500}
                          loading="lazy"
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
                        <h3 className="font-bold text-foreground text-lg">{safari.title}</h3>
                      </Link>
                      <p className="text-muted-foreground text-sm">{safari.description}</p>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4" />{safari.location}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {safari.highlights.map((h) => (
                          <span key={h} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">{h}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
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
                )))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} preselectedSafari={selectedSafari} />
      </div>
    </PageTransition>
  );
};

export default Safaris;
