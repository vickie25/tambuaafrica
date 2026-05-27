import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation, useCounter } from "@/hooks/useScrollAnimation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { encodePublicImageSrc } from "@/lib/public-image-path";

const stats = [
  { value: 16, suffix: "+", label: "Years Experience" },
  { value: 500, suffix: "+", label: "Happy Clients" },
  { value: 20, suffix: "+", label: "Regional Routes" },
  { value: 50, suffix: "+", label: "Safari Packages" },
];

const AboutPreview = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="section-padding bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/40 rounded-l-[100px] -z-10 hidden lg:block" />

      <div className="container-wide mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-5 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-accent flex-shrink-0" />
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
                  Our Story
                </span>
              </div>
              <h2 className="font-display font-bold text-foreground leading-tight mb-6" style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}>
                Curating East Africa Journeys Since 2008
              </h2>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="section-lead mb-8"
            >
              Tambua Africa Tours &amp; Safaris is among the premier safari companies in Nairobi, Kenya — offering tailor-made safaris, luxury lodge experiences, Maasai Mara migration tours, and serene beach holidays. We craft unforgettable journeys with deep local knowledge and uncompromising standards.
            </motion.p>
            
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="space-y-4 mb-10"
            >
              {[
                "Licensed regional safari specialists",
                "Expert local guides across East Africa",
                "Sustainable and community-conscious travel",
                "Flexible itineraries tailored to your style"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-base text-foreground font-medium font-sans">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </motion.ul>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Button asChild className="btn-pill bg-primary px-8 py-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 group">
                <Link to="/about">
                  Discover Our Story <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Image & Stats Content */}
          <div className="lg:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl"
            >
              <img
                src={encodePublicImageSrc("/images/real images frm Tambua/Team.jpeg")}
                alt="Tambua Africa safari guides team"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </motion.div>
            
            {/* Stats Card - Overlapping */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute -bottom-8 -left-4 sm:-bottom-12 sm:-left-8 lg:-bottom-10 lg:-left-12 xl:-left-16 bg-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-border/50 max-w-sm w-[calc(100%-2rem)] sm:w-auto"
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                {stats.map((stat, i) => (
                  <StatItem key={stat.label} {...stat} delay={0.6 + (i * 0.1)} isInView={isInView} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ value, suffix, label, delay, isInView }: { value: number; suffix: string; label: string; delay: number; isInView: boolean }) => {
  const count = useCounter(value, 2000, isInView);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center sm:text-left"
    >
      <div className="text-3xl sm:text-4xl font-display font-bold text-accent mb-1">
        {count}{suffix}
      </div>
      <div className="text-[11px] sm:text-xs font-sans uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
    </motion.div>
  );
};

export default AboutPreview;
