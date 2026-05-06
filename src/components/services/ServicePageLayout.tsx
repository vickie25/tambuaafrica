import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import OptimizedImage from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type CtaTopic = "ticketing" | "transfers" | "lodges";

type ServicePageLayoutProps = {
  title: string;
  eyebrow?: string;
  subtitle: string;
  heroImage: string;
  heroFallback: string;
  heroAlt: string;
  ctaTopic: CtaTopic;
  children: ReactNode;
};

const topicLabel: Record<CtaTopic, string> = {
  ticketing: "air & road ticketing",
  transfers: "transfers",
  lodges: "lodge & camp booking",
};

export function ServicePageLayout({
  title,
  eyebrow = "Services",
  subtitle,
  heroImage,
  heroFallback,
  heroAlt,
  ctaTopic,
  children,
}: ServicePageLayoutProps) {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <header className="relative overflow-hidden bg-primary pt-28 pb-16 text-primary-foreground lg:pt-36 lg:pb-24">
          <div className="absolute inset-0 z-0 opacity-25">
            <OptimizedImage
              src={heroImage}
              fallbackSrc={heroFallback}
              alt={heroAlt}
              className="h-full w-full object-cover"
              priority
              width={1280}
              height={720}
              quality={72}
              sizes="100vw"
            />
          </div>
          <div className="container-wide relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <nav className="mb-6 text-sm text-primary-foreground/80">
              <Link to="/services" className="hover:text-white">
                Services
              </Link>
              <span className="mx-2 opacity-60">/</span>
              <span className="text-white">{title}</span>
            </nav>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance text-primary-foreground sm:text-4xl md:text-5xl md:leading-[1.1]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-primary-foreground/90 sm:text-lg">
              {subtitle}
            </p>
          </div>
        </header>

        <main className="container-wide mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">{children}</main>

        <section className="border-t border-border bg-muted/40 py-12 sm:py-16">
          <div className="container-wide mx-auto flex flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Ready to plan the logistics?</h2>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Tell us dates, party size, and preferences, we reply with options and next steps. You can also browse curated
              stays on our Destinations page.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link to={`/contact?topic=${ctaTopic}`} className="inline-flex items-center gap-2">
                  Request a quote <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl bg-background">
                <Link to="/destinations">Browse destinations & lodges</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mention {topicLabel[ctaTopic]} in your message so the right specialist picks it up first.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
