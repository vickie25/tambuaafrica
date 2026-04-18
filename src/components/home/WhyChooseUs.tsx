import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Shield, Sparkles, DollarSign, Users, Headphones, Globe } from "lucide-react";

const features = [
  { icon: Shield, title: "Expert Knowledge", description: "Our guides have deep local knowledge and decades of safari experience." },
  { icon: Sparkles, title: "Tailor Made", description: "Every safari is customized to match your preferences and budget." },
  { icon: DollarSign, title: "Competitive Prices", description: "Premium experiences at fair prices with no hidden costs." },
  { icon: Users, title: "Small Groups", description: "Intimate group sizes for a more personal and immersive experience." },
  { icon: Headphones, title: "24/7 Support", description: "Round-the-clock assistance throughout your entire safari journey." },
  { icon: Globe, title: "Sustainable Tourism", description: "Committed to eco-friendly practices and community development." },
];

const WhyChooseUs = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-white text-foreground" ref={ref}>
      <div className="container-wide mx-auto">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 text-foreground">The Tambua Africa Difference</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            We go above and beyond to ensure your African adventure exceeds every expectation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-muted/50 border border-border rounded-2xl p-6 hover:bg-muted transition-all duration-500 hover:-translate-y-1 hover:shadow-xl group ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-black group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
