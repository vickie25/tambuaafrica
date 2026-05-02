import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation, useCounter } from "@/hooks/useScrollAnimation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const stats = [
  { value: 16, suffix: "+", label: "Years Experience" },
  { value: 500, suffix: "+", label: "Happy Clients" },
  { value: 20, suffix: "+", label: "Regional Routes" },
  { value: 50, suffix: "+", label: "Safari Packages" },
];

const AboutPreview = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-card" ref={ref}>
      <div className="container-wide mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="/images/real images frm Tambua/Team.jpeg"
                alt="East Africa safari landscape"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-card rounded-xl shadow-xl p-5 border border-border">
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <StatItem key={stat.label} {...stat} isVisible={isVisible} />
                ))}
              </div>
            </div>
          </div>

          <div className={`space-y-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Curating East Africa Journeys with Local Expertise Since 2008
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Tambua Africa Tours & Safaris is a Nairobi-based operator creating bespoke journeys across Kenya and the wider East Africa region. We combine on-the-ground logistics, trusted local partnerships, and destination expertise to shape trips that feel seamless and deeply personal.
            </p>
            <ul className="space-y-3">
              {["Licensed regional safari specialists", "Expert local guides across East Africa", "Sustainable and community-conscious travel", "Flexible itineraries for different budgets and travel styles"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    {item}
                  </li>
                )
              )}
            </ul>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6">
              <Link to="/about">
                Learn More <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ value, suffix, label, isVisible }: { value: number; suffix: string; label: string; isVisible: boolean }) => {
  const count = useCounter(value, 2000, isVisible);
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-primary">
        {count}{suffix}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
};

export default AboutPreview;
