import { useRef } from "react";
import { useInView } from "framer-motion";
import { Shield, Sparkles, DollarSign, Users, Headphones, Globe } from "lucide-react";

const features = [
  { icon: Shield, title: "Expert Knowledge", description: "Our guides have deep local knowledge and decades of safari experience across East Africa.", num: "01" },
  { icon: Sparkles, title: "Tailor Made", description: "Every safari is customized to match your preferences, travel style, and budget.", num: "02" },
  { icon: DollarSign, title: "Competitive Prices", description: "Premium experiences at fair prices with full transparency — no hidden costs.", num: "03" },
  { icon: Users, title: "Small Groups", description: "Intimate group sizes for a more personal and deeply immersive safari experience.", num: "04" },
  { icon: Headphones, title: "24/7 Support", description: "Round-the-clock assistance throughout your entire journey, from booking to return.", num: "05" },
  { icon: Globe, title: "Sustainable Tourism", description: "Committed to eco-friendly practices, wildlife conservation, and community development.", num: "06" },
];

const WhyChooseUs = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-primary py-24 sm:py-32">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Large watermark number */}
      <div
        className="absolute -top-6 right-0 select-none pointer-events-none"
        aria-hidden
        style={{
          fontFamily: "'Cormorant', serif",
          fontSize: "clamp(10rem, 25vw, 22rem)",
          fontWeight: 700,
          lineHeight: 1,
          color: "rgba(255,255,255,0.04)",
          letterSpacing: "-0.04em",
        }}
      >
        WHY
      </div>

      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div
          className="max-w-2xl mb-16 sm:mb-20"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "none" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-accent flex-shrink-0" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
              Why Choose Us
            </span>
          </div>
          <h2
            className="font-display font-bold text-white leading-tight mb-4 text-balance"
            style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)" }}
          >
            Travel with Absolute Confidence
          </h2>
          <p className="font-sans text-white/60 text-base leading-relaxed font-light">
            We go above and beyond to ensure your African adventure exceeds every expectation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-primary p-8 sm:p-10 hover:bg-white/5 transition-colors duration-300 cursor-default"
              style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "none" : "translateY(28px)",
                transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms`,
              }}
            >
              {/* Big editorial number */}
              <div
                className="absolute top-4 right-6 font-display font-bold text-white/[0.06] select-none pointer-events-none leading-none"
                style={{ fontSize: "5rem" }}
                aria-hidden
              >
                {feature.num}
              </div>

              {/* Icon */}
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 transition-all duration-300 group-hover:bg-accent">
                <feature.icon className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" />
              </div>

              <h3 className="font-display font-bold text-white text-xl mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="font-sans text-white/55 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
