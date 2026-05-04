import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import OptimizedImage from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Plane, Bus, Hotel, ArrowRight } from "lucide-react";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const cards = [
  {
    title: "Air & road ticketing",
    path: "/services/ticketing",
    topic: "ticketing" as const,
    description:
      "We book flights and long-distance road tickets on your behalf, including domestic hops, international arrivals, and coach routes that match your safari dates.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    alt: "View from an aircraft window",
    icon: Plane,
  },
  {
    title: "Road & air transfers",
    path: "/services/transfers",
    topic: "transfers" as const,
    description:
      "Private airport meet-and-greets, lodge and park-gate transfers, and coordinated light-air links so every segment lines up with the rest of your trip.",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80",
    alt: "Safari vehicle on a savannah track",
    icon: Bus,
  },
  {
    title: "Lodge & camp booking",
    path: "/services/lodges-camps",
    topic: "lodges" as const,
    description:
      "Kenyan safari lodges, classic tented camps, city hotels, and selected campsites, chosen to your budget, style, and park locations.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    alt: "Safari lodge pool at sunset",
    icon: Hotel,
  },
];

const ServicesHub = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <header className="relative overflow-hidden bg-primary pt-28 pb-16 text-primary-foreground lg:pt-36 lg:pb-20">
          <div className="absolute inset-0 z-0 opacity-20">
            <OptimizedImage
              src="/images/maasai-mara-authentic.webp"
              fallbackSrc={fallbackSafariImage("services-hub-hero")}
              alt="Kenya savannah"
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="container-wide relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Full-trip support</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl md:text-5xl">Services</h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
              Tambua Africa plans more than game drives. We book tickets, coordinate ground and air transfers, and reserve
              lodges and camps to your specifications, so logistics stay in one place with a team that knows Kenya.
            </p>
          </div>
        </header>

        <main className="container-wide mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground">How we help</h2>
            <p className="mt-3 text-muted-foreground">
              Each page below explains what we arrange, how it works with safaris or independent travel, and what details
              help us quote faster. When you are ready, use the quote button with the same team and same attention to detail.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.path}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <OptimizedImage
                      src={card.image}
                      fallbackSrc={fallbackSafariImage(`services-hub-${card.topic}`)}
                      alt={card.alt}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background/90 text-accent shadow-sm backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <Button asChild className="rounded-xl">
                        <Link to={card.path} className="inline-flex items-center gap-2">
                          Read more <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-xl bg-background">
                        <Link to={`/contact?topic=${card.topic}`}>Get a quote</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default ServicesHub;
