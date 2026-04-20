import { useEffect, useMemo, useRef, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Compass, Palmtree, Binoculars, Mountain, Activity, Wind } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useCarouselImages } from "@/hooks/useCarouselImages";

const activities = [
  {
    icon: Compass,
    title: "Cultural Tours",
    description: "Immerse yourself in the rich traditions and heritage of East African communities.",
    images: [
      "/images/popular activities/culture tours.webp",
      "/images/popular activities/culture tours (2).webp",
    ],
  },
  {
    icon: Palmtree,
    title: "Beach Holidays",
    description: "Relax on pristine white sand beaches along the beautiful Kenyan coastline.",
    images: [
      "/images/popular activities/beach.webp",
      "/images/popular activities/Diani Beach (2).webp",
      "/images/popular activities/Chale Island.webp",
      "/images/popular activities/chale Hotel.webp",
    ],
  },
  {
    icon: Binoculars,
    title: "Game Drives",
    description: "Experience thrilling wildlife encounters in Kenya's world-renowned national parks.",
    images: [
      "/images/popular activities/game drives.webp",
      "/images/popular activities/game drives1.webp",
    ],
  },
  {
    icon: Mountain,
    title: "Hiking Adventures",
    description: "Challenge yourself with spectacular treks across East Africa's majestic mountains.",
    images: [
      "/images/popular activities/Hiking.webp",
      "/images/popular activities/Hike.webp",
      "/images/popular activities/Hiking (2).webp",
    ],
  },
  {
    icon: Activity,
    title: "Bungee & Jumping",
    description: "Leap into adventure with heart-pounding bungee jumps over iconic landscapes.",
    images: [
      "/images/popular activities/Bangee and Jumping.webp",
      "/images/popular activities/Jumping (2).webp",
      "/images/popular activities/Jumping.webp",
    ],
  },
  {
    icon: Wind,
    title: "Zipline Canopy",
    description: "Soar through the air on breathtaking ziplines across lush tropical forests.",
    images: [
      "/images/popular activities/Zipline 2.webp",
      "/images/popular activities/Zipline.webp",
      "/images/popular activities/zipline (2).webp",
    ],
  },
];

type ActivityItem = (typeof activities)[number];

const ActivityCard = ({
  activity,
  index,
  isVisible,
}: {
  activity: ActivityItem;
  index: number;
  isVisible: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

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

  const autoplayPlugins = useMemo(
    () => (isInView ? [Autoplay({ delay: 7000, stopOnInteraction: true })] : []),
    [isInView]
  );

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Carousel
        className="w-full h-full absolute inset-0"
        opts={{ loop: true, duration: 24 }}
        plugins={autoplayPlugins}
      >
        <CarouselContent className="-ml-0 h-full">
          {activity.images.map((image, i) => (
            <CarouselItem key={image} className="pl-0 h-full">
              <OptimizedImage
                src={image}
                alt={`${activity.title} image ${i + 1}`}
                className="w-full h-full aspect-[4/5] object-cover transition-transform duration-700 md:group-hover:scale-110"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots className="bottom-4 z-20" />
      </Carousel>

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
  const { data: sectionImages = [] } = useCarouselImages("activities");

  return (
    <section className="section-padding bg-background" ref={ref}>
      <div className="container-wide mx-auto">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">Popular Activities</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Choose from our most popular adventure categories and create memories that last a lifetime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.title}
              activity={{
                ...activity,
                images: sectionImages.length > 0 ? sectionImages : activity.images,
              }}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
