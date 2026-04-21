import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import HeroSection from "@/components/home/HeroSection";
import ActivitiesSection from "@/components/home/ActivitiesSection";
import AboutPreview from "@/components/home/AboutPreview";
import FeaturedSafaris from "@/components/home/FeaturedSafaris";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import DestinationsSection from "@/components/home/DestinationsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PartnersSection from "@/components/home/PartnersSection";
import FAQSection from "@/components/home/FAQSection";
import BlogPreview from "@/components/home/BlogPreview";
import CTABanner from "@/components/home/CTABanner";
import HomeFeatureHero from "@/components/home/HomeFeatureHero";
import { useCarouselImages } from "@/hooks/useCarouselImages";

const Index = () => {
  const { data: wildFeatureImages = [] } = useCarouselImages("feature_wild");
  const { data: cultureFeatureImages = [] } = useCarouselImages("feature_culture");
  const { data: luxuryFeatureImages = [] } = useCarouselImages("feature_luxury");

  const wildFallbackImages = [
    "/images/wildbeast-migration-1.webp",
    "/images/wildbeast-migration-2.webp",
    "/images/wildbeast-migration-3.webp",
  ];

  const cultureFallbackImages = [
    "/images/maasai-mara-authentic.webp",
    "/images/culture.webp",
    "/images/asher-pardey-8woRhVgXU-4-unsplash.webp",
  ];

  const luxuryFallbackImages = [
    "/images/HOTEL ROOM.webp",
    "/images/destiations/Tsavo/voi lodge swimming pool.webp",
    "/images/destiations/Tsavo/Kilaguni serena safari lodge food sfood.webp",
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <HeroSection />
          
          {/* Feature Hero Section 1: Wildlife & Nature */}
          <HomeFeatureHero 
            slogan="Experience the Wild"
            title="Witness the Great Migration"
            description="Embark on an unforgettable journey through Africa's most iconic landscapes, where nature's greatest spectacles unfold before your eyes."
            images={wildFeatureImages.length > 0 ? wildFeatureImages : wildFallbackImages}
            align="left"
          />

          {/* Feature Hero Section 2: Heritage & Culture */}
          <HomeFeatureHero 
            slogan="Our Cultural Heritage"
            title="Connect with Local Roots"
            description="Immerse yourself in the vibrant traditions and hospitality of East Africa. Meet the people who call this land home and share in their stories."
            images={cultureFeatureImages.length > 0 ? cultureFeatureImages : cultureFallbackImages}
            interval={2600}
            align="right"
          />

          {/* Feature Hero Section 3: Luxury & Adventure */}
          <HomeFeatureHero 
            slogan="Luxury Reimagined"
            title="Premium Safari Lodging"
            description="Experience the perfect blend of wild adventure and modern luxury. Boutique stays in the heart of the savannah, tailored just for you."
            images={luxuryFeatureImages.length > 0 ? luxuryFeatureImages : luxuryFallbackImages}
            interval={2800}
            align="left"
          />

          <ActivitiesSection />
          <AboutPreview />
          <FeaturedSafaris />
          <WhyChooseUs />
          <DestinationsSection />
          <TestimonialsSection />
          <PartnersSection />
          <FAQSection />
          <BlogPreview />
          <CTABanner />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
