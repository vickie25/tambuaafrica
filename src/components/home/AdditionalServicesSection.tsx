import { Link } from "react-router-dom";
import { Plane, Bus, Hotel, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useSiteMarketingBlock } from "@/hooks/useSiteMarketingBlocks";
import { SITE_MARKETING_IDS } from "@/lib/site-marketing-defaults";
import OptimizedImage from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Plane,
    title: "Air & road ticketing",
    description:
      "Domestic and international flights, plus intercity coaches and shuttles, timed with your safari or coastal extension.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80",
    alt: "Aircraft wing above clouds",
    path: "/services/ticketing",
    topic: "ticketing" as const,
  },
  {
    icon: Bus,
    title: "Road & air transfers",
    description:
      "Private airport and lodge transfers, park gate pickups, and light-air hops where they suit your route, and we handle the schedule.",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80",
    alt: "Safari vehicle on savannah road",
    path: "/services/transfers",
    topic: "transfers" as const,
  },
  {
    icon: Hotel,
    title: "Lodge & camp bookings",
    description:
      "Hand-picked lodges, tented camps, and boutique stays across East Africa, matched to your parks, budget, and travel style.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    alt: "Luxury lodge pool at sunset",
    path: "/services/lodges-camps",
    topic: "lodges" as const,
  },
];

const AdditionalServicesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: intro } = useSiteMarketingBlock(SITE_MARKETING_IDS.homeServicesIntro);

  return (
    <section className="section-padding bg-muted/30" ref={ref}>
      <div className="container-wide mx-auto">
        <div
          className={`mb-12 text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">{intro.eyebrow}</span>
          <h2 className="mt-2 max-w-4xl mx-auto text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            {intro.headline}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg leading-relaxed">
            {intro.body}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-8">
          {services.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-lg ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <OptimizedImage
                    src={item.image}
                    alt={item.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background/90 text-accent shadow-sm backdrop-blur-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <h3 className="text-base font-bold text-foreground sm:text-lg">{item.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.description}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap">
                    <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
                      <Link to={item.path} className="inline-flex items-center gap-2">
                        How this works <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild className="w-full rounded-xl sm:w-auto">
                      <Link to={`/contact?topic=${item.topic}`}>Get a quote</Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdditionalServicesSection;
