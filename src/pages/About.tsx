import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { useScrollAnimation, useCounter } from "@/hooks/useScrollAnimation";
import { CheckCircle2, Heart, Leaf, Globe, Users, Award, Plane, Bus, Hotel } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import PageHero from "@/components/layout/PageHero";
import { encodePublicImageSrc } from "@/lib/public-image-path";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const values = [
  { icon: Heart, title: "Passion", description: "We are passionate about East Africa and crafting journeys that feel personal, immersive, and memorable." },
  { icon: Leaf, title: "Sustainability", description: "Committed to responsible travel practices that protect wildlife, habitats, and host communities." },
  { icon: Globe, title: "Integrity", description: "Transparent pricing, honest advice, and thoughtful planning at every stage of the trip." },
  { icon: Users, title: "Community", description: "Supporting local guides, camps, and community partnerships across the region." },
  { icon: Award, title: "Excellence", description: "Delivering polished travel experiences with strong logistics and warm hospitality." },
  { icon: CheckCircle2, title: "Safety", description: "Your safety comes first with trusted partners, vetted routes, and experienced teams." },
];

const team = [
  {
    name: "Jorim Marenya",
    role: "Executive Director",
    image: "/images/real images frm Tambua/Team/Jorim Marenya ~ Executive Director.png",
  },
  {
    name: "Isaac Wilson Marenya",
    role: "Director (Operations)",
    image: "/images/real images frm Tambua/Team/Isaac Wilson Marenya ~ Director (operations).jpeg",
  },
  {
    name: "Ashley Marenya",
    role: "Director (Marketing)",
    image: "/images/real images frm Tambua/Team/Ashley Marenya ~ Director (Marketing).jpeg",
  },
  {
    name: "Venus Grace Marenya",
    role: "Director (Marketing)",
    image: "/images/real images frm Tambua/Team/VENUS GRACE MARENYA ~ DIRECTOR (MARKETING).jpeg",
  },
];

const About = () => {
  const { ref: storyRef, isVisible: storyVisible } = useScrollAnimation();
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();
  const { ref: teamRef, isVisible: teamVisible } = useScrollAnimation();
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();

  return (
    <PageTransition>
    <div className="min-h-screen">
      <Navbar />
      <main>
        <PageHero
          eyebrow="About Us"
          title="Our Story"
          description="Over 16 years of designing unforgettable journeys across Kenya and the wider East Africa region."
          imageSrc="/images/real images frm Tambua/St the park drive.jpeg"
          imageAlt="Safari drive through a Kenyan national park"
          fallbackSrc={fallbackSafariImage("about-hero")}
        />

        <section className="section-padding bg-background" ref={storyRef}>
          <div className="container-wide mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${storyVisible ? "opacity-100" : "opacity-0 translate-y-8"}`}>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/50 shadow-xl ring-1 ring-border/40">
                <img src={encodePublicImageSrc("/images/real images frm Tambua/Tourists at Nairobi park.jpeg")} alt="Tourists at Nairobi park" className="w-full h-full object-cover" loading="lazy" />
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

        <section className="section-padding bg-background" ref={servicesRef}>
          <div className="container-wide mx-auto">
            <div className={`text-center mb-12 transition-all duration-700 ${servicesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Full-trip support</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">Ticketing, transfers & lodges</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Alongside safaris, we help travellers with air and road tickets, reliable transfers, and lodge or camp
                reservations, so the journey from your front door to the bush stays coordinated.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Plane,
                  title: "Air & road ticketing",
                  text: "Domestic and international flights, plus coach and shuttle options when they fit your route and budget.",
                  path: "/services/ticketing",
                },
                {
                  icon: Bus,
                  title: "Road & air transfers",
                  text: "Airport and hotel pickups, park gate transfers, and light-air connections arranged around your itinerary.",
                  path: "/services/transfers",
                },
                {
                  icon: Hotel,
                  title: "Lodge & hotel booking",
                  text: "Curated stays from city hotels to bush camps, chosen for location, comfort, and how they pair with your parks.",
                  path: "/services/lodges-camps",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={`rounded-none border border-border/50 bg-card p-8 shadow-sm hover:shadow-xl transition-all duration-700 hover:-translate-y-1 ${servicesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-none bg-accent/10 group-hover:bg-accent transition-colors">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  <Link
                    to={item.path}
                    className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    How this works
                  </Link>
                </div>
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
                  className={`p-8 rounded-none border border-border/50 bg-card hover:shadow-xl transition-all duration-700 hover:-translate-y-1 border-t-4 hover:border-t-accent ${valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-none bg-accent/10 flex items-center justify-center mb-6 transition-colors hover:bg-accent">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {team.map((member, i) => (
                <div
                  key={member.name}
                  className={`text-center transition-all duration-500 justify-self-center ${teamVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="aspect-[3/4] rounded-none overflow-hidden mb-5 w-64 max-w-full mx-auto shadow-lg hover:shadow-2xl transition-shadow border border-border/50">
                    <img src={encodePublicImageSrc(member.image)} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
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
