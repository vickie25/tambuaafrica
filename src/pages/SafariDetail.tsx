import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useSafari } from "@/hooks/useSafaris";
import BookingModal from "@/components/booking/BookingModal";
import { Star, MapPin, Clock, CheckCircle2, ArrowLeft, Users, Calendar, Shield, Loader2 } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";
import { SITE_NAME, SITE_ORIGIN, absoluteUrl, truncateMetaDescription } from "@/lib/seo";

const itineraries: Record<string, string[]> = {
  "masai-mara-serengeti-circuit": [
    "Day 1: Arrive Nairobi → briefing and overnight stay",
    "Day 2: Drive to Masai Mara → afternoon game drive",
    "Day 3: Full-day Mara safari → river crossings and big-cat tracking",
    "Day 4: Cross into Tanzania → continue to Serengeti with evening game drive",
    "Day 5: Full-day Serengeti exploration → optional balloon safari",
    "Day 6: Ngorongoro rim stop or cultural visit depending on routing",
    "Day 7: Departure transfer via Arusha or Nairobi",
  ],
  "amboseli-tarangire-trails": [
    "Day 1: Nairobi → Amboseli → sunset game drive beneath Kilimanjaro",
    "Day 2: Full-day Amboseli safari → Observation Hill and marshlands",
    "Day 3: Cross to Tanzania → continue to Tarangire National Park",
    "Day 4: Full-day Tarangire game drive among baobabs and elephant herds",
    "Day 5: Return transfer to Arusha or Nairobi",
  ],
  "uganda-gorilla-escape": [
    "Day 1: Arrive Entebbe → transfer to Bwindi region",
    "Day 2: Gorilla trekking briefing → rainforest trek → community visit",
    "Day 3: Optional forest walk or Batwa cultural experience",
    "Day 4: Scenic return transfer for departure",
  ],
  "zanzibar-bush-beach": [
    "Day 1: Arrive northern Tanzania → short safari game drive",
    "Day 2: Morning wildlife experience → flight to Zanzibar",
    "Day 3: Stone Town heritage walk and spice tour",
    "Day 4: Beach day with optional dhow cruise or snorkeling",
    "Day 5: Leisure along the coast",
    "Day 6: Departure transfer",
  ],
  "rwanda-primates-culture": [
    "Day 1: Arrive Kigali → city highlights and genocide memorial visit",
    "Day 2: Transfer to Volcanoes National Park → cultural village stop",
    "Day 3: Primate experience or volcano foothill exploration",
    "Day 4: Lake Kivu relaxation or scenic drive through Rwanda's hills",
    "Day 5: Return to Kigali for departure",
  ],
  "lamu-swahili-coastline": [
    "Day 1: Fly to Lamu → heritage walk through Old Town",
    "Day 2: Dhow sailing, seafood lunch, and Shela beach time",
    "Day 3: Slow island day with optional wellness or water activities",
    "Day 4: Return flight and departure",
  ],
};

const included = ["Park entry fees", "Accommodation", "Meals as specified", "Professional guide", "4x4 safari vehicle", "Airport transfers", "Drinking water"];
const excluded = ["International flights", "Visa fees", "Travel insurance", "Tips & gratuities", "Personal items", "Alcoholic beverages"];

const SafariDetail = () => {
  const { id } = useParams();
  const [bookingOpen, setBookingOpen] = useState(false);
  const { data: safari, isLoading } = useSafari(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!safari) {
    return (
      <div className="min-h-screen">
        <Helmet>
          <title>{`Safari not found | ${SITE_NAME}`}</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold text-foreground">Safari not found</h1>
          <Button asChild className="mt-6"><Link to="/safaris">Back to Safaris</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const days = itineraries[safari.id] || ["Contact us for a detailed itinerary."];
  const pageUrl = `${SITE_ORIGIN}/safaris/${safari.id}`;
  const metaDescription = truncateMetaDescription(`${safari.description} ${safari.location}. ${safari.duration}.`);
  const ogImage = absoluteUrl(safari.image);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: safari.title,
    description: safari.description,
    touristType: "Safari",
    image: ogImage,
    provider: {
      "@type": "TravelAgency",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    ...(safari.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: safari.price,
            priceCurrency: "USD",
            url: pageUrl,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`${safari.title} | ${SITE_NAME}`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={`${safari.title} | ${SITE_NAME}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={safari.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Navbar />
      <main>
        <section className="relative h-[60vh] min-h-[400px]">
          <OptimizedImage
            src={safari.image}
            fallbackSrc={fallbackSafariImage(safari.id)}
            alt={safari.title}
            className="absolute inset-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="container-wide mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Link to="/safaris" className="inline-flex items-center gap-2 text-white/70 text-sm mb-4 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Safaris
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-accent text-sm">
                    <Star className="w-4 h-4 fill-current" /> {safari.rating}
                    <span className="text-white/60">({safari.reviews} reviews)</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{safari.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-white/70 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{safari.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{safari.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />Max 12 guests</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-wide mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">{safari.description}</p>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    This carefully planned itinerary combines standout wildlife, local culture, and well-paced travel across East Africa, giving you a richer regional perspective without losing comfort or flexibility. Ask us to layer in domestic flights, lodge upgrades, or private transfers so the trip feels turnkey from arrival to departure.
                  </p>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Highlights</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {safari.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-3 p-3 bg-card rounded-none border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-foreground text-sm font-medium">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-accent" /> Itinerary
                  </h2>
                  <div className="space-y-3">
                    {days.map((day, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex gap-4 p-4 bg-card rounded-none border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <span className="text-accent font-bold text-sm">{i + 1}</span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">{day}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">What's Included</h3>
                    <ul className="space-y-2">
                      {included.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">Not Included</h3>
                    <ul className="space-y-2">
                      {excluded.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-4 h-4 flex items-center justify-center shrink-0 text-muted-foreground">✕</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card rounded-none border border-border/50 p-6 shadow-lg space-y-5">
                  <div>
                    <span className="text-xs text-muted-foreground">From</span>
                    <div className="text-3xl font-bold text-primary">${safari.price}<span className="text-base text-muted-foreground font-normal">/person</span></div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="text-foreground font-medium">{safari.duration}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-foreground font-medium">{safari.location}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Group Size</span>
                      <span className="text-foreground font-medium">Max 12</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <Star className="w-4 h-4 text-accent fill-current" /> {safari.rating}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setBookingOpen(true)}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-none py-5 text-base font-semibold"
                  >
                    Book This Safari
                  </Button>

                  <div className="flex items-start gap-2 p-4 bg-primary/5 rounded-none border border-primary/10">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Flexible planning</span> with tailored routing, regional add-ons, and expert support before departure.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} preselectedSafari={safari.id} />
    </div>
  );
};

export default SafariDetail;
