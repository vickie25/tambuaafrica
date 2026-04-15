import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Destination } from "@/data/destinations";
import { destinationLodges, Lodge } from "@/data/destinations-lodges";
import { useDestinations } from "@/hooks/useDestinations";
import { ArrowRight, MapPin, Star, X, ChevronLeft, ChevronRight, Bed } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/contexts/AuthContext";
import OptimizedImage from "@/components/ui/optimized-image";
import BookingModal from "@/components/booking/BookingModal";

// ─────────────────────────────────────────────────────────
// Image slider
// ─────────────────────────────────────────────────────────
const ImageSlider = ({ images, name, priority = false }: { images: string[]; name: string; priority?: boolean }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <OptimizedImage
          key={i}
          src={src}
          alt={`${name} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          priority={priority && i === 0}
        />
      ))}
    </>
  );
};


// ─────────────────────────────────────────────────────────
// Lodge card inside destination modal
// ─────────────────────────────────────────────────────────
const LodgeCard = ({
  lodge,
  onClick,
}: {
  lodge: Lodge;
  onClick: () => void;
}) => (
  <div
    className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-background hover:shadow-lg transition-all duration-300"
    onClick={onClick}
  >
    <div className="relative h-48 overflow-hidden">
      <OptimizedImage
        src={lodge.image}
        alt={lodge.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
    <div className="p-4">
      <h4 className="font-bold text-foreground text-base mb-1">{lodge.name}</h4>
      <p className="text-muted-foreground text-sm line-clamp-2">{lodge.description}</p>
      <div className="flex items-center gap-1 mt-3 text-accent text-sm font-semibold">
        <span>View Details</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// Lodge detail modal
// ─────────────────────────────────────────────────────────
const LodgeModal = ({
  lodge,
  destinationName,
  onClose,
  onBooking,
}: {
  lodge: Lodge;
  destinationName: string;
  onClose: () => void;
  onBooking: (destinationName: string, lodgeName?: string) => void;
}) => {
  const { user } = useAuth();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-64 rounded-t-2xl overflow-hidden">
          <OptimizedImage
            src={lodge.image}
            alt={lodge.name}
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="text-2xl font-bold text-foreground">{lodge.name}</h3>
          </div>
          <p className="text-accent font-semibold text-sm mb-4 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {destinationName}, Kenya
          </p>

          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            {lodge.description}
          </p>

          {/* Story */}
          <div className="bg-muted/40 rounded-xl p-4 mb-5">
            <p className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">
              The Experience
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed italic">
              "{lodge.story}"
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Highlights
            </p>
            <ul className="space-y-2">
              {lodge.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80">
                  <span className="text-accent mt-0.5 shrink-0">✦</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <button
              onClick={() => onBooking(destinationName, lodge.name)}
              className="flex-1 bg-accent text-white font-semibold px-5 py-3 rounded-lg text-center hover:bg-accent/90 transition text-sm"
            >
              {user ? 'Book This Lodge' : 'Contact About This Lodge'}
            </button>
            {lodge.website && (
              <a
                href={lodge.website}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-accent text-accent font-semibold px-5 py-3 rounded-lg hover:bg-accent/10 transition text-sm"
              >
                Official Site
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Destination card + expanded modal with lodges
// ─────────────────────────────────────────────────────────
const DestinationModal = ({
  dest,
  onClose,
}: {
  dest: Destination;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLodge, setSelectedLodge] = useState<Lodge | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Lodge["category"] | "all">("all");

  const lodgeData = destinationLodges.find((d) => d.destinationId === dest.id);
  const lodges = lodgeData?.lodges ?? [];

  const filtered =
    categoryFilter === "all"
      ? lodges
      : lodges.filter((l) => l.category === categoryFilter);

  const categories = Array.from(new Set(lodges.map((l) => l.category)));

  const handleBooking = (destinationName: string, lodgeName?: string) => {
    if (user) {
      // User is logged in - show booking modal (no specific safari ID, just inquiry)
      // For now, navigate to contact page for destination-specific booking
      const bookingParams = new URLSearchParams({ destination: destinationName });
      if (lodgeName) bookingParams.set('lodge', lodgeName);
      navigate(`/booking?${bookingParams.toString()}`);
    } else {
      // User is not logged in, go to contact page
      const contactParams = new URLSearchParams({ 
        inquiry: 'booking',
        destination: destinationName,
        ...(lodgeName && { lodge: lodgeName })
      });
      navigate(`/contact?${contactParams.toString()}`);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !selectedLodge) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, selectedLodge]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col overflow-auto"
        onClick={onClose}
      >
        <div
          className="min-h-screen w-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header image */}
          <div className="relative h-72 md:h-96 shrink-0">
            <img
              src={dest.images?.[0] || dest.image}
              alt={dest.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
            <button
              onClick={onClose}
              className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">{dest.name}</h2>
              <p className="text-white/80 mt-1 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {dest.country}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="bg-background flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-6">{dest.description}</p>

            {/* Features */}
            {dest.features && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Why Visit</h3>
                <ul className="space-y-2">
                  {dest.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/80">
                      <span className="text-accent shrink-0 mt-0.5">✦</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Story */}
            {dest.story && (
              <div className="bg-muted/40 rounded-xl p-5 mb-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
                  The Story
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  "{dest.story}"
                </p>
              </div>
            )}

            {/* Lodges section */}
            {lodges.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Bed className="w-5 h-5 text-accent" />
                    Hotels & Lodges ({lodges.length})
                  </h3>
                  {/* Filter buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                        categoryFilter === "all"
                          ? "bg-accent text-white border-accent"
                          : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                      }`}
                      onClick={() => setCategoryFilter("all")}
                    >
                      All
                    </button>
                    {(["luxury", "mid-range", "budget", "camp"] as const)
                      .filter((c) => categories.includes(c))
                      .map((c) => (
                        <button
                          key={c}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border transition capitalize ${
                            categoryFilter === c
                              ? "bg-accent text-white border-accent"
                              : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                          }`}
                          onClick={() => setCategoryFilter(c)}
                        >
                          {c === "mid-range" ? "Mid-Range" : c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                      ))}
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No lodges in this category for {dest.name}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((lodge) => (
                      <LodgeCard
                        key={lodge.id}
                        lodge={lodge}
                        onClick={() => setSelectedLodge(lodge)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => handleBooking(dest.name)}
                className="bg-accent text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-accent/90 transition"
              >
                {user ? 'Book This Destination' : 'Contact Us About This Destination'}
              </button>
              <button
                className="border border-accent text-accent font-semibold px-6 py-3 rounded-lg hover:bg-accent/10 transition"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lodge detail modal stacked on top */}
      {selectedLodge && (
        <LodgeModal
          lodge={selectedLodge}
          destinationName={dest.name}
          onClose={() => setSelectedLodge(null)}
          onBooking={handleBooking}
        />
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────
const Destinations = () => {
  const { user } = useAuth();
  const { ref, isVisible } = useScrollAnimation();
  const [selected, setSelected] = useState<Destination | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { data: destinations = [], isLoading } = useDestinations();

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <main>
          {/* Hero */}
          <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-primary text-primary-foreground">
            <div className="absolute inset-0 z-0 opacity-20">
              <OptimizedImage 
                src="/images/diani-beach-coast.webp" 
                alt="Destinations Background" 
                className="w-full h-full object-cover"
                priority 
              />
            </div>
            <div className="container-wide relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-white font-semibold text-sm uppercase tracking-wider">
                Ready to Travel With Real Adventure and Enjoy Natural
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold mt-3">Destinations</h1>
              <p className="text-primary-foreground/70 mt-4 max-w-2xl mx-auto text-lg">
                Explore Kenya's premier safari destinations
              </p>
            </div>
          </section>

          {/* Kenya Destinations */}
          <section className="section-padding bg-background" ref={ref}>
            <div className="container-wide mx-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 animate-spin">
                      <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent"></div>
                    </div>
                    <p className="mt-4 text-muted-foreground">Loading destinations...</p>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.filter(dest => dest.country === 'Kenya').map((dest, index) => {
                  const lodgeCount =
                    destinationLodges.find((d) => d.destinationId === dest.id)?.lodges.length ?? 0;

                  return (
                    <div
                      key={dest.id}
                      className={`group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer transition-all duration-500 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: `${index * 80}ms` }}
                      onClick={() => setSelected(dest)}
                    >
                      <ImageSlider images={dest.images || [dest.image]} name={dest.name} priority={index < 3} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-bold text-xl">{dest.name}</h3>
                        <p className="text-white/70 text-sm mt-2 line-clamp-2">
                          {dest.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-accent text-sm font-semibold">
                          <Bed className="w-4 h-4" />
                          {lodgeCount > 0
                            ? `${lodgeCount} Hotels & Lodges`
                            : dest.safariCount
                            ? `${dest.safariCount} Hotels & Lodges`
                            : "View Lodges"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          </section>


        </main>
        <Footer />
        <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
      </div>

      {/* Destination + lodge modal */}
      {selected && (
        <DestinationModal dest={selected} onClose={() => setSelected(null)} />
      )}
    </PageTransition>
  );
};

export default Destinations;
