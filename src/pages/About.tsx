import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { useScrollAnimation, useCounter } from "@/hooks/useScrollAnimation";
import { CheckCircle2, Heart, Leaf, Globe, Users, Award } from "lucide-react";

const values = [
  { icon: Heart, title: "Passion", description: "We are passionate about East Africa and crafting journeys that feel personal, immersive, and memorable." },
  { icon: Leaf, title: "Sustainability", description: "Committed to responsible travel practices that protect wildlife, habitats, and host communities." },
  { icon: Globe, title: "Integrity", description: "Transparent pricing, honest advice, and thoughtful planning at every stage of the trip." },
  { icon: Users, title: "Community", description: "Supporting local guides, camps, and community partnerships across the region." },
  { icon: Award, title: "Excellence", description: "Delivering polished travel experiences with strong logistics and warm hospitality." },
  { icon: CheckCircle2, title: "Safety", description: "Your safety comes first with trusted partners, vetted routes, and experienced teams." },
];

const team = [
  { name: "James Kimani", role: "Founder & Safari Director", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
  { name: "Grace Wanjiku", role: "Regional Operations Lead", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80" },
  { name: "David Ochieng", role: "Lead Guide & Naturalist", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80" },
  { name: "Amina Hassan", role: "Guest Experience Manager", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80" },
];

const About = () => {
  const { ref: storyRef, isVisible: storyVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();
  const { ref: teamRef, isVisible: teamVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();

  return (
    <PageTransition>
    <div className="min-h-screen">
      <Navbar />
      <main>
        <section className="relative pt-32 pb-20 bg-primary text-primary-foreground">
          <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3">Our Story</h1>
            <p className="text-primary-foreground/70 mt-4 max-w-2xl mx-auto text-lg">
              Over 16 years of designing unforgettable journeys across Kenya and the wider East Africa region.
            </p>
          </div>
        </section>

        <section className="section-padding bg-background" ref={storyRef}>
          <div className="container-wide mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${storyVisible ? "opacity-100" : "opacity-0 translate-y-8"}`}>
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src="/images/real images frm Tambua/Tourists at Nairobi park.jpeg" alt="Tourists at Nairobi park" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="space-y-5">
                <h2 className="text-3xl font-bold text-foreground">Crafting East Africa Journeys Since 2008</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tambua Africa Tours & Safaris was founded in Nairobi with a clear mission: to make East Africa feel accessible, exciting, and deeply rewarding for travelers from around the world. What began as a Kenya-focused operator has grown into a regional travel partner for multi-country safari and beach journeys.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our team brings destination knowledge across Kenya, Tanzania, Uganda, Rwanda, and the Indian Ocean coast. We design itineraries that balance wildlife, culture, pace, comfort, and logistics so every trip feels effortless on the ground.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Based on Plainsview Road, off Mombasa Road in Nairobi, we coordinate classic safaris, gorilla trekking, cultural encounters, family journeys, and coast extensions for travelers seeking East Africa beyond a single destination.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card" ref={statsRef}>
          <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: 16, suffix: "+", label: "Years Experience" },
                { value: 500, suffix: "+", label: "Happy Clients" },
                { value: 5, suffix: "", label: "Core Countries" },
                { value: 50, suffix: "+", label: "Safari Packages" },
              ].map((s) => (
                <StatBlock key={s.label} {...s} isVisible={statsVisible} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-background" ref={valuesRef}>
          <div className="container-wide mx-auto">
            <div className="text-center mb-12">
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Values</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">What Drives Us</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <div
                  key={v.title}
                  className={`p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-500 ${valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <v.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-card" ref={teamRef}>
          <div className="container-wide mx-auto">
            <div className="text-center mb-12">
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Team</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">Meet the Experts</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <div
                  key={member.name}
                  className={`text-center transition-all duration-500 ${teamVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <h3 className="font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </PageTransition>
  );
};

const StatBlock = ({ value, suffix, label, isVisible }: { value: number; suffix: string; label: string; isVisible: boolean }) => {
  const count = useCounter(value, 2000, isVisible);
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-primary">{count}{suffix}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

export default About;
