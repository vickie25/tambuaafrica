import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import HeroSection from "@/components/home/HeroSection";
import ActivitiesSection from "@/components/home/ActivitiesSection";
import AboutPreview from "@/components/home/AboutPreview";
import FeaturedSafaris from "@/components/home/FeaturedSafaris";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import AdditionalServicesSection from "@/components/home/AdditionalServicesSection";
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
            images={wildFeatureImages}
            align="left"
          />

          {/* Feature Hero Section 2: Heritage & Culture */}
          <HomeFeatureHero 
            slogan="Our Cultural Heritage"
            title="Connect with Local Roots"
            description="Immerse yourself in the vibrant traditions and hospitality of East Africa. Meet the people who call this land home and share in their stories."
            images={cultureFeatureImages}
            interval={2600}
            align="right"
          />

          {/* Feature Hero Section 3: Luxury & Adventure */}
          <HomeFeatureHero 
            slogan="Luxury Reimagined"
            title="Premium Safari Lodging"
            description="Experience the perfect blend of wild adventure and modern luxury. Boutique stays in the heart of the savannah, tailored just for you."
            images={luxuryFeatureImages}
            interval={2800}
            align="left"
          />

          <ActivitiesSection />
          <AboutPreview />
          <FeaturedSafaris />
          <WhyChooseUs />
          <AdditionalServicesSection />
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
