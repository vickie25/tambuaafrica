import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

const CTABanner = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 lg:py-40 overflow-hidden bg-primary">
      {/* Background Image with Parallax effect */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={isInView ? { scale: 1 } : { scale: 1.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/images/real images frm Tambua/Lion.jpeg"
          alt="African Safari Landscape"
          className="w-full h-full object-cover"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-primary/80 to-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container-wide relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              Your Journey Awaits
            </span>
            <div className="h-px w-8 bg-accent" />
          </div>

          <h2 
            className="font-display font-bold text-white leading-tight mb-8"
            style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
          >
            Ready to Experience the <br className="hidden sm:block" />
            <em className="text-accent not-italic" style={{ fontStyle: "italic" }}>Magic of Africa?</em>
          </h2>
          
          <p className="font-sans text-white/80 text-lg sm:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            Let our experts craft a personalized itinerary that matches your dreams, travel style, and budget. The safari of a lifetime begins here.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button 
              asChild 
              size="lg" 
              className="btn-pill bg-accent text-white hover:bg-accent/90 px-10 py-7 text-base font-semibold shadow-2xl shadow-accent/20 w-full sm:w-auto group"
            >
              <Link to="/contact">
                Start Planning
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="btn-pill bg-transparent border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-7 text-base font-medium w-full sm:w-auto"
            >
              <Link to="/safaris">
                Browse Packages
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
