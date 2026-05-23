import { useEffect, useRef, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Compass, Palmtree, Binoculars, Mountain, Activity, Wind } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { useCarouselImageItems } from "@/hooks/useCarouselImages";
import { motion, useReducedMotion } from "framer-motion";

const activities = [
  {
    icon: Binoculars,
    title: "Game Drive",
    section: "Wildlife Safaris",
    description: "Track the Big Five with expert guides on sunrise and sunset drives across iconic savannah parks.",
    images: [
      "/images/popular activities/game drives.webp",
      "/images/popular activities/game drives1.webp",
    ],
    imageAlt: "Kenya wildlife game drive safari in Maasai Mara",
  },
  {
    icon: Palmtree,
    title: "Beach Holidays",
    section: "Beach Holidays",
    description: "Unwind on white-sand beaches, enjoy ocean views, and experience laid-back coastal island life.",
    images: [
      "/images/popular activities/beach.webp",
      "/images/popular activities/Diani Beach (2).webp",
      "/images/popular activities/Chale Island.webp",
      "/images/popular activities/chale Hotel.webp",
    ],
    imageAlt: "Diani Beach Kenya holiday package coastal safari",
  },
  {
    icon: Wind,
    title: "Zipline Canopy",
    section: "Wildlife Safaris",
    description: "Glide above forest canopies for adrenaline-filled aerial views and unforgettable nature thrills.",
    images: [
      "/images/popular activities/Zipline 2.webp",
      "/images/popular activities/Zipline.webp",
      "/images/popular activities/zipline (2).webp",
    ],
    imageAlt: "Forest zipline adventure tour Kenya",
  },
  {
    icon: Mountain,
    title: "Hiking Adventures",
    section: "Wildlife Safaris",
    description: "Take guided trails through hills and mountains, from scenic day hikes to challenging summit routes.",
    images: [
      "/images/popular activities/Hiking.webp",
      "/images/popular activities/Hike.webp",
      "/images/popular activities/Hiking (2).webp",
    ],
    imageAlt: "Kenya hiking adventure wildlife tours",
  },
  {
    icon: Compass,
    title: "Cultural Tours",
    section: "Cultural Tours",
    description: "Meet local communities, explore living traditions, and discover authentic East African heritage.",
    images: [
      "/images/popular activities/culture tours.webp",
      "/images/popular activities/culture tours (2).webp",
    ],
    imageAlt: "Cultural tours Kenya Maasai community experience",
  },
  {
    icon: Activity,
    title: "Bungee & Jumping",
    section: "Wildlife Safaris",
    description: "Push your limits with high-energy jumps and bungee experiences designed for pure adventure.",
    images: [
      "/images/popular activities/Bangee and Jumping.webp",
      "/images/popular activities/Jumping (2).webp",
      "/images/popular activities/Jumping.webp",
    ],
    imageAlt: "Adventure bungee jumping experience Kenya",
  },
];

const DISPLAY_ORDER = [
  "Game Drive",
  "Beach Holidays",
  "Cultural Tours",
  "Bungee & Jumping",
  "Zipline Canopy",
  "Hiking Adventures",
] as const;

type ActivityItem = (typeof activities)[number];
type ActivityIconKey = "compass" | "palmtree" | "binoculars" | "mountain" | "activity" | "wind";

const activityIconMap: Record<ActivityIconKey, ActivityItem["icon"]> = {
  compass: Compass,
  palmtree: Palmtree,
  binoculars: Binoculars,
  mountain: Mountain,
  activity: Activity,
  wind: Wind,
};

const ActivityCard = ({
  activity,
  index,
  isVisible,
  shouldReduceMotion,
}: {
  activity: ActivityItem;
  index: number;
  isVisible: boolean;
  shouldReduceMotion: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const target = cardRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.35, rootMargin: "150px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || shouldReduceMotion || activity.images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % activity.images.length);
    }, 2200 + ((index % 6) * 350));
    return () => clearInterval(timer);
  }, [activity.images.length, index, isInView, shouldReduceMotion]);

  useEffect(() => {
    if (currentImage >= activity.images.length) {
      setCurrentImage(0);
    }
  }, [activity.images.length, currentImage]);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="absolute inset-0">
        {activity.images.map((image, i) => (
          <motion.div
            key={image}
            initial={false}
            animate={{ opacity: i === currentImage ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: "linear" }}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={image}
              alt={`${activity.title} image ${i + 1}`}
              className="w-full h-full aspect-[4/5] object-cover transition-transform duration-700 md:group-hover:scale-110"
              width={600}
              height={750}
            />
          </motion.div>
        ))}
      </div>
      {activity.images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
          {activity.images.map((_, dotIndex) => (
            <button
              key={`${activity.title}-${dotIndex}`}
              type="button"
              aria-label={`Go to activity image ${dotIndex + 1}`}
              className={`h-2 min-w-[8px] min-h-[8px] rounded-full transition-all ${
                dotIndex === currentImage ? "w-4 bg-white" : "w-2 bg-white/50"
              }`}
              onClick={() => setCurrentImage(dotIndex)}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="w-12 h-12 rounded-xl bg-accent/90 flex items-center justify-center mb-3">
          <activity.icon className="w-6 h-6 text-accent-foreground" />
        </div>
        <h3 className="text-xl font-bold">{activity.title}</h3>
        <p className="text-white/70 text-sm mt-1 leading-relaxed">{activity.description}</p>
      </div>
    </div>
  );
};

const ActivitiesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const shouldReduceMotion = useReducedMotion();
  const { data: adminActivities = [] } = useCarouselImageItems("activities");

  const activityByTitle = activities.reduce<Record<string, ActivityItem>>((acc, activity) => {
    acc[activity.title.toLowerCase()] = activity;
    return acc;
  }, {});

  const groupedAdminImages = adminActivities.reduce<Record<string, { images: string[]; iconKey?: string | null }>>(
    (acc, item) => {
      const titleKey = (item.title || "").trim().toLowerCase();
      if (!titleKey || !activityByTitle[titleKey]) return acc;
      if (!acc[titleKey]) acc[titleKey] = { images: [], iconKey: item.iconKey || null };
      acc[titleKey].images.push(item.url);
      if (item.iconKey) acc[titleKey].iconKey = item.iconKey;
      return acc;
    },
    {}
  );

  const displayActivities: ActivityItem[] = activities.map((baseActivity) => {
    const key = baseActivity.title.toLowerCase();
    const adminGroup = groupedAdminImages[key];
    const resolvedIcon =
      adminGroup?.iconKey && activityIconMap[adminGroup.iconKey as ActivityIconKey]
        ? activityIconMap[adminGroup.iconKey as ActivityIconKey]
        : baseActivity.icon;

    return {
      ...baseActivity,
      icon: resolvedIcon,
      images: adminGroup?.images?.length ? adminGroup.images : baseActivity.images,
    };
  });

  const orderedActivities = DISPLAY_ORDER.map((title) =>
    displayActivities.find((a) => a.title === title)
  ).filter((a): a is ActivityItem => Boolean(a));

  return (
    <section className="section-padding bg-background" ref={ref}>
      <div className="container-wide mx-auto">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">Popular Activities</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base">
            Wildlife safaris, Kenya beach holiday packages, and cultural tours Kenya travelers love — all planned by our Nairobi team.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
          {orderedActivities.map((activity, index) => (
            <ActivityCard
              key={activity.title}
              activity={activity}
              index={index}
              isVisible={isVisible}
              shouldReduceMotion={!!shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
