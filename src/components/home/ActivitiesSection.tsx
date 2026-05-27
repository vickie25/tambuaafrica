import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mountain, Camera, Sunrise, Map, Heart, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const activities = [
  { id: "wildlife", icon: Camera, title: "Wildlife Safaris", description: "Witness the Big Five and the Great Migration in world-renowned national parks and reserves.", image: "/images/real images frm Tambua/Tanzania.jpeg" },
  { id: "mountain", icon: Mountain, title: "Mountain Trekking", description: "Scale the heights of Mount Kenya or Kilimanjaro with our experienced climbing guides.", image: "/images/real images frm Tambua/kilimajaro.webp" },
  { id: "cultural", icon: Heart, title: "Cultural Encounters", description: "Engage authentically with local Maasai and Samburu communities and learn their rich traditions.", image: "/images/real images frm Tambua/Masai.webp" },
  { id: "balloon", icon: Sunrise, title: "Balloon Safaris", description: "Float silently over the savanna at dawn, followed by a champagne breakfast in the bush.", image: "/images/real images frm Tambua/balooon.webp" },
  { id: "beach", icon: Compass, title: "Beach Extensions", description: "Unwind on the pristine white-sand beaches of Diani or Zanzibar after your thrilling safari.", image: "/images/real images frm Tambua/Diani.jpeg" },
  { id: "custom", icon: Map, title: "Bespoke Itineraries", description: "Work with our experts to design a completely personalized journey that matches your exact dreams.", image: "/images/real images frm Tambua/Elephant.jpeg" },
];

const ActivitiesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [activeTab, setActiveTab] = useState(activities[0].id);

  return (
    <section className="section-padding bg-background relative overflow-hidden" ref={ref}>
      <div className="container-wide mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-px w-8 bg-accent" />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
              Experiences
            </span>
            <div className="h-px w-8 bg-accent" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-bold text-foreground leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
          >
            Curated <em className="text-accent not-italic" style={{ fontStyle: "italic" }}>Adventures</em>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="section-lead mx-auto"
          >
            Beyond traditional game drives, we offer a diverse portfolio of authentic African experiences designed to create memories that last a lifetime.
          </motion.p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 min-h-[600px] lg:min-h-[500px]">
          
          {/* Interactive List (Left) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-2 lg:pr-8">
            {activities.map((activity, index) => {
              const isActive = activeTab === activity.id;
              return (
                <motion.button
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveTab(activity.id)}
                  className={`w-full text-left p-5 sm:p-6 rounded-2xl transition-all duration-300 flex items-start gap-5 group cursor-pointer ${
                    isActive 
                      ? "bg-secondary border border-border shadow-sm" 
                      : "hover:bg-secondary/50 border border-transparent"
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 transition-colors duration-300 ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-primary"}`}>
                    <activity.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-display font-bold text-xl mb-2 transition-colors duration-300 ${isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>
                      {activity.title}
                    </h3>
                    <div className={`grid transition-all duration-300 ease-in-out ${isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <p className="overflow-hidden text-muted-foreground text-sm leading-relaxed font-sans pr-4">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Image Display (Right) */}
          <div className="lg:col-span-7 relative h-[400px] sm:h-[500px] lg:h-auto rounded-3xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              {activities.map((activity) => (
                activity.id === activeTab && (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-80" />
                    
                    {/* Floating Content over image */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                      <Button asChild className="btn-pill bg-white text-primary hover:bg-white/90 shadow-xl group px-8">
                        <Link to={`/safaris?type=${activity.id}`} className="inline-flex items-center gap-2 font-semibold">
                          Explore {activity.title}
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
