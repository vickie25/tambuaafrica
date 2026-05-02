import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1535941339077-2dd1c7963098?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      <div className="relative z-10 container-wide mx-auto section-padding text-center text-primary-foreground">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl mx-auto leading-tight">
          Ready to Start Your{" "}
          <span className="font-display italic text-accent">Safari Adventure?</span>
        </h2>
        <p className="text-primary-foreground/70 mt-4 max-w-xl mx-auto text-lg">
          Book today and enjoy exclusive early-bird discounts. Members save up to 50% on selected safari packages.
        </p>
        <div className="flex flex-row flex-wrap items-center justify-center gap-3 mt-8 max-w-lg mx-auto">
          <Button
            asChild
            size="lg"
            className="min-w-0 flex-1 sm:flex-initial bg-accent text-accent-foreground hover:bg-accent/90 text-base px-6 py-6 sm:px-8 rounded-xl font-semibold"
          >
            <Link to="/contact">
              Book Now <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-0 flex-1 sm:flex-initial border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-6 py-6 sm:px-8 rounded-xl bg-transparent"
          >
            <Link to="/safaris">Browse Packages</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
