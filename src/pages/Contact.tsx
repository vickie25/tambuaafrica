import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import PageHero from "@/components/layout/PageHero";
import { submitInquiry } from "@/lib/inquiry";
import { toast } from "sonner";
import { TEAM_CONTACT_EMAILS } from "@/lib/admin-email";
import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";
import { trackConversion } from "@/components/seo/GoogleAnalytics";

const emptyForm = { name: "", email: "", phone: "", subject: "", message: "" };

const ContactEmailList = () => (
  <div className="space-y-0.5">
    {TEAM_CONTACT_EMAILS.map((email) => (
      <a
        key={email}
        href={`mailto:${email}`}
        className="block text-muted-foreground text-sm hover:text-accent transition-colors"
      >
        {email}
      </a>
    ))}
  </div>
);

const Contact = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const inquiry = searchParams.get("inquiry");
    const destination = searchParams.get("destination");
    const lodge = searchParams.get("lodge");
    const topic = searchParams.get("topic");

    const topicLabels: Record<string, { subject: string; message: string }> = {
      ticketing: {
        subject: "Air & road ticketing",
        message:
          "Hello, I would like help with domestic or international flights and/or long-distance road tickets for my trip. Here are my rough dates and route:\n\n",
      },
      transfers: {
        subject: "Road & air transfers",
        message:
          "Hello, I need private road transfers and/or coordinated air hops (e.g. airport, hotel, park gates). Arrival details and preferred times:\n\n",
      },
      lodges: {
        subject: "Lodge & camp booking",
        message:
          "Hello, I would like help booking lodges or camps (and city hotels if needed). Parks, budget, and style preferences:\n\n",
      },
    };

    if (topic && topicLabels[topic]) {
      const { subject, message } = topicLabels[topic];
      setFormData((prev) => ({
        ...prev,
        subject: prev.subject || subject,
        message: prev.message || message,
      }));
      return;
    }

    if (!inquiry && !destination && !lodge) return;

    const destinationText = destination ? `Destination: ${destination}` : "";
    const lodgeText = lodge ? `Lodge: ${lodge}` : "";
    const composed = [destinationText, lodgeText].filter(Boolean).join(" | ");

    setFormData((prev) => ({
      ...prev,
      subject: prev.subject || (inquiry === "booking" ? "Booking Inquiry" : prev.subject),
      message: prev.message || (composed ? `Hello, I would like help with ${composed}.` : prev.message),
    }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitInquiry({
        inquiryType: "contact",
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      if (result.emailSent === false) {
        toast.warning("Message saved, but email delivery failed. Please check Resend/Supabase function secrets.");
      } else {
        toast.success("Message sent successfully. Our team will reply by email.");
      }
      trackConversion("generate_lead", { method: "contact_form" });
      setFormData(emptyForm);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not send your message right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen">
      <Navbar />
      <main>
        <PageHero
          eyebrow="Get In Touch"
          title="Contact Tambua Africa Tours & Safaris"
          description="Planning Kenya, Uganda, Tanzania, Rwanda, or a wider East Africa journey? We'd love to help, including air & road ticketing, private transfers, and lodge or camp bookings alongside your safari."
          imageSrc="/images/amboseli-real.webp"
          imageAlt="Contact Tambua Africa Nairobi Kenya safari operator"
        >
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-primary-foreground/90">
            <Link to="/services" className="font-semibold underline-offset-2 transition-colors hover:text-white hover:underline">
              All services
            </Link>
            <span className="opacity-50" aria-hidden>
              |
            </span>
            <Link to="/services/ticketing" className="transition-colors hover:text-white hover:underline">
              Ticketing
            </Link>
            <Link to="/services/transfers" className="transition-colors hover:text-white hover:underline">
              Transfers
            </Link>
            <Link to="/services/lodges-camps" className="transition-colors hover:text-white hover:underline">
              Lodges & camps
            </Link>
          </p>
        </PageHero>

        <section className="section-padding bg-background" ref={ref}>
          <div className="container-wide mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-5 gap-12 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-8"}`}>
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
                  <p className="text-muted-foreground">
                    Have questions about safaris, gorilla trekking, beach extensions, or a custom East Africa itinerary?
                    We also arrange flight and coach tickets, road and light-air transfers, and lodge stays. Tell us what
                    you need and our team will respond within 24 hours.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* UK Office Block */}
                  <div className="p-6 rounded-none bg-muted/40 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" /> UK Office
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Physical Location</div>
                          <div className="text-muted-foreground text-sm">London, United Kingdom</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Phone</div>
                          <div className="text-muted-foreground text-sm">+44 793 997 0489</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Email</div>
                          <ContactEmailList />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kenya Office Block */}
                  <div className="p-6 rounded-none bg-muted/40 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" /> Kenya Office
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Physical Location</div>
                          <div className="text-muted-foreground text-sm">Standard Street, Floor 4, Suite 16, Nairobi, Kenya</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Phone</div>
                          <div className="text-muted-foreground text-sm">+254 726 207 900 | +254 792 329 682 | +254 704 548 78</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">WhatsApp</div>
                          <div className="text-muted-foreground text-sm">{WHATSAPP_DISPLAY}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Email</div>
                          <ContactEmailList />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-none bg-accent/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">Working Hours</div>
                      <div className="text-muted-foreground text-sm">Mon - Sat: 8:00 AM - 6:00 PM EAT</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-none bg-primary text-primary-foreground shadow-md">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" /> Why Travel With Us?
                  </h3>
                  <ul className="space-y-2 text-sm text-primary-foreground/80">
                    <li>• Regional safari planning across East Africa</li>
                    <li>• Tailor-made itineraries for wildlife, culture, and coast</li>
                    <li>• 24/7 trip support before and during travel</li>
                    <li>• Transparent pricing with trusted local expertise</li>
                  </ul>
                </div>

                <div className="rounded-none overflow-hidden border border-border/50 aspect-[16/10] min-h-[240px] shadow-sm">
                  <iframe
                    title="Tambua Africa Tours office location in Nairobi, Kenya"
                    src="https://maps.google.com/maps?q=Standard+Street%2C+Nairobi%2C+Kenya&z=15&output=embed"
                    className="w-full h-full min-h-[240px] border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="bg-card rounded-none border border-border/50 p-8 sm:p-10 space-y-6 shadow-sm">
                  <h3 className="text-xl font-bold text-foreground">Send us a Message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <Input placeholder="+254 700 000 000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Subject</label>
                      <Input placeholder="East Africa safari planning" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Message</label>
                    <Textarea placeholder="Tell us about your dream itinerary, countries of interest, travel dates, or budget..." rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-none py-6 text-base font-semibold disabled:opacity-70">
                    {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />} Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default Contact;
