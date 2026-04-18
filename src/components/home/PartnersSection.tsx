import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const partners = [
  { name: "TRA (Tourism Regulatory Authority)", logo: "/images/logos/tra.png" },
  { name: "TripAdvisor", logo: "/images/logos/tripadvisor.svg" },
  { name: "Safari Bookings", logo: "/images/logos/safaribookings.webp" },
];

const PartnersSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-16 bg-card border-y border-border" ref={ref}>
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Trusted By</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Our Partners & Affiliations</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center justify-center transition-all duration-300 grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
              title={partner.name}
            >
              <div className="bg-slate-50/50 p-6 rounded-xl flex items-center justify-center w-full h-24">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
