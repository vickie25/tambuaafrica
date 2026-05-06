import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Destination } from "@/data/destinations";
import { destinationLodges, Lodge } from "@/data/destinations-lodges";
import { useDestinationLodges } from "@/hooks/useDestinationLodges";
import { useDestinations } from "@/hooks/useDestinations";
import { ArrowRight, MapPin, Star, X, ChevronLeft, ChevronRight, Bed } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAuth } from "@/contexts/AuthContext";
import OptimizedImage from "@/components/ui/optimized-image";
import BookingModal from "@/components/booking/BookingModal";
import { useReducedMotion } from "framer-motion";
import { fallbackDestinationImage, fallbackLodgeImage } from "@/lib/remote-media-fallbacks";

const DESTINATION_DISPLAY_ORDER = [
  "tsavo",
  "masai-mara",
  "samburu",
  "nakuru",
  "naivasha",
  "amboseli",
  "mombasa",
  "wasini",
  "diani",
  "chale-island",
  "watamu",
  "mombasa-north-coast",
  "mombasa-south-coast",
] as const;

const DESTINATION_ID_ALIASES: Record<string, string[]> = {
  tsavo: ["tsavo", "tsavo-east"],
  "masai-mara": ["masai-mara", "maasai-mara"],
  samburu: ["samburu"],
  nakuru: ["nakuru", "lake-nakuru"],
  naivasha: ["naivasha", "lake-naivasha"],
  amboseli: ["amboseli"],
  mombasa: ["mombasa"],
  wasini: ["wasini", "wasini-island"],
  diani: ["diani", "diani-beach"],
  "chale-island": ["chale-island", "chale"],
  watamu: ["watamu"],
  "mombasa-north-coast": ["mombasa-north-coast", "north-coast"],
  "mombasa-south-coast": ["mombasa-south-coast", "south-coast"],
};

const getCanonicalDestinationKey = (dest: Destination) => {
  const id = dest.id.toLowerCase();
  for (const [canonical, aliases] of Object.entries(DESTINATION_ID_ALIASES)) {
    if (aliases.includes(id)) return canonical;
  }

  const name = dest.name.toLowerCase();
  if (name.includes("tsavo")) return "tsavo";
  if (name.includes("mara")) return "masai-mara";
  if (name.includes("samburu")) return "samburu";
  if (name.includes("nakuru")) return "nakuru";
  if (name.includes("naivasha")) return "naivasha";
  if (name.includes("amboseli")) return "amboseli";
  if (name.includes("wasini")) return "wasini";
  if (name.includes("diani")) return "diani";
  if (name.includes("chale")) return "chale-island";
  if (name.includes("watamu")) return "watamu";
  if (name.includes("north coast")) return "mombasa-north-coast";
  if (name.includes("south coast")) return "mombasa-south-coast";
  if (name.includes("mombasa")) return "mombasa";
  return id;
};

const getLodgeDataForDestination = (dest: Destination, groups: typeof destinationLodges) => {
  const canonical = getCanonicalDestinationKey(dest);
  return groups.find((d) => d.destinationId === canonical);
};

// ─────────────────────────────────────────────────────────
// Image slider
// ─────────────────────────────────────────────────────────
const ImageSlider = ({
  images,
  name,
  destinationId,
  priority = false,
  shouldReduceMotion = false,
}: {
  images: string[];
  name: string;
  destinationId: string;
  priority?: boolean;
  shouldReduceMotion?: boolean;
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!priority) return;
    const shouldPreloadSecondImage =
      typeof window !== "undefined" && !window.matchMedia("(max-width: 768px)").matches;
    const maxImagesToPreload = shouldPreloadSecondImage ? 2 : 1;
    images.slice(0, maxImagesToPreload).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images, priority]);

  useEffect(() => {
    if (images.length <= 1 || shouldReduceMotion) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length, shouldReduceMotion]);

  return (
    <>
      {images.map((src, i) => (
        <OptimizedImage
          key={i}
          src={src}
          fallbackSrc={fallbackDestinationImage(`${destinationId}-${i}-${src}`)}
          alt={`${name} ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 md:group-hover:scale-110 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          priority={priority && i < 2}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
  <button
    type="button"
    className="group cursor-pointer rounded-xl overflow-hidden border border-border bg-background hover:shadow-lg transition-all duration-300"
    onClick={onClick}
  >
    <div className="relative h-48 overflow-hidden">
      <OptimizedImage
        src={lodge.image}
        fallbackSrc={fallbackLodgeImage(lodge.id)}
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
  </button>
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="lodge-modal-title"
    >
      <div
        className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Hero image */}
        <div className="relative h-64 rounded-t-2xl overflow-hidden">
          <OptimizedImage
            src={lodge.image}
            fallbackSrc={fallbackLodgeImage(lodge.id)}
            alt={lodge.name}
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
            aria-label="Close lodge details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {lodge.images && lodge.images.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto border-b border-border bg-muted/25 px-3 py-3">
            {lodge.images.slice(0, 10).map((img, idx) => (
              <div key={`${lodge.id}-thumb-${idx}`} className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-border">
                <OptimizedImage
                  src={img}
                  fallbackSrc={fallbackLodgeImage(`${lodge.id}-thumb-${idx}`)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 id="lodge-modal-title" className="text-2xl font-bold text-foreground">{lodge.name}</h3>
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
  lodgeGroups,
  onClose,
}: {
  dest: Destination;
  lodgeGroups: typeof destinationLodges;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLodge, setSelectedLodge] = useState<Lodge | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Lodge["category"] | "all">("all");

  const lodgeData = getLodgeDataForDestination(dest, lodgeGroups);
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="destination-modal-title"
      >
        <div
          className="min-h-screen w-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header image */}
          <div className="relative h-72 md:h-96 shrink-0">
            <OptimizedImage
              src={dest.images?.[0] || dest.image}
              alt={dest.name}
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
            <button
              onClick={onClose}
              className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5 transition"
              aria-label="Close destination details"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 id="destination-modal-title" className="text-3xl md:text-4xl font-bold text-white">{dest.name}</h2>
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
  const shouldReduceMotion = useReducedMotion();
  const { ref, isVisible } = useScrollAnimation();
  const [selected, setSelected] = useState<Destination | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { data: destinations = [], isLoading } = useDestinations();
  const { data: lodgeGroups = destinationLodges } = useDestinationLodges();

  const displayedDestinations = useMemo(() => {
    const kenya = destinations.filter((d) => d.country === "Kenya" || !d.country?.trim());
    const ordered = DESTINATION_DISPLAY_ORDER.map((canonical) =>
      kenya.find((d) => getCanonicalDestinationKey(d) === canonical),
    ).filter((d): d is Destination => Boolean(d));
    const seen = new Set(ordered.map((d) => d.id));
    const rest = kenya.filter((d) => !seen.has(d.id));
    return [...ordered, ...rest];
  }, [destinations]);

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <main>
          {/* Hero */}
          <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-primary text-primary-foreground">
            <div className="absolute inset-0 z-0 opacity-20">
              <OptimizedImage 
                src="/images/chale-extra-1.webp"
                fallbackSrc={fallbackDestinationImage("page-hero")}
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
                Explore Kenya&apos;s premier safari destinations, coast, and lakes, each card opens curated lodges and
                camp ideas you can book with Tambua.
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
              <>
              <div
                className={`mb-12 grid gap-6 rounded-2xl border border-border bg-card/80 p-6 sm:p-8 shadow-sm sm:grid-cols-3 transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Wildlife circuits</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Mara, Tsavo, Amboseli, Samburu, and the Rift lakes, with classic game drives, migration windows, and
                    family-friendly pacing.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Coast & islands</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Diani, Watamu, Chale, and Wasini pair reef blues with bush time, ideal for honeymoon or bush-to-beach
                    combos.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Where you sleep</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Lodges, tented camps, and boutique stays we know personally. Filter by luxury, mid-range, budget, or
                    camp style inside each destination.
                  </p>
                </div>
              </div>

              {displayedDestinations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
                  <p className="text-muted-foreground">
                    No destinations are available from the server right now. Please refresh in a moment or contact us on
                    WhatsApp and we&apos;ll send sample itineraries.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                  >
                    Contact Tambua <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedDestinations.map((dest, index) => {
                  const lodgeCount = getLodgeDataForDestination(dest, lodgeGroups)?.lodges.length ?? 0;

                  return (
                    <button
                      type="button"
                      key={dest.id}
                      className={`group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer transition-all duration-500 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: `${index * 80}ms` }}
                      onClick={() => setSelected(dest)}
                      aria-label={`Open details for ${dest.name}`}
                    >
                      <OptimizedImage
                        src={dest.images?.[0] || dest.image}
                        fallbackSrc={fallbackDestinationImage(dest.id)}
                        alt={dest.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                        priority={index < 6}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
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
                    </button>
                  );
                })}
              </div>
              )}
              </>
              )}
            </div>
          </section>


        </main>
        <Footer />
        <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
      </div>

      {/* Destination + lodge modal */}
      {selected && (
        <DestinationModal dest={selected} lodgeGroups={lodgeGroups} onClose={() => setSelected(null)} />
      )}
    </PageTransition>
  );
};

export default Destinations;
