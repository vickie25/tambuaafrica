import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import PageHero from "@/components/layout/PageHero";
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
        <PageHero
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={subtitle}
          imageSrc={heroImage}
          imageAlt={heroAlt}
          fallbackSrc={heroFallback}
          breadcrumb={
            <nav>
              <Link to="/services" className="transition-colors hover:text-white">
                Services
              </Link>
              <span className="mx-2 opacity-60">/</span>
              <span className="text-white">{title}</span>
            </nav>
          }
        />

        <main className="container-wide mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">{children}</main>

        <section className="border-t border-border section-alt py-12 sm:py-16">
          <div className="container-wide mx-auto flex flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
            <h2 className="section-title text-2xl sm:text-3xl">Ready to plan the logistics?</h2>
            <p className="section-lead max-w-xl">
              Tell us dates, party size, and preferences — we reply with options and next steps. You can also browse curated
              stays on our Destinations page.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="btn-pill">
                <Link to={`/contact?topic=${ctaTopic}`} className="inline-flex items-center gap-2">
                  Request a quote <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-pill bg-background">
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
