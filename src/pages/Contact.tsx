import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import OptimizedImage from "@/components/ui/optimized-image";
import { submitInquiry } from "@/lib/inquiry";
import { toast } from "sonner";

const emptyForm = { name: "", email: "", phone: "", subject: "", message: "" };

const Contact = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

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

      const whatsappText = `Hello! My name is ${formData.name}.\n\nI have an inquiry regarding: ${formData.subject}\n\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`;
      const whatsappUrl = `https://wa.me/254704548878?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, '_blank');

      toast.success(
        result.googleSheetsSynced
          ? "Message sent! Opening WhatsApp to connect directly with our team."
          : "Message sent! Opening WhatsApp to connect directly with our team.",
      );
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
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 z-0 opacity-20">
            <OptimizedImage 
              src="/images/nairobi-real.webp" 
              alt="Contact Us Background" 
              className="w-full h-full object-cover"
              priority 
            />
          </div>
          <div className="container-wide relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Get In Touch</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3">Contact Us</h1>
            <p className="text-primary-foreground/70 mt-4 max-w-2xl mx-auto text-lg">
              Planning Kenya, Uganda, Tanzania, Rwanda, or a wider East Africa journey? We&apos;d love to help.
            </p>
          </div>
        </section>

        <section className="section-padding bg-background" ref={ref}>
          <div className="container-wide mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-5 gap-12 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0 translate-y-8"}`}>
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
                  <p className="text-muted-foreground">
                    Have questions about safaris, gorilla trekking, beach extensions, or a custom East Africa itinerary? Reach out and our team will respond within 24 hours.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* UK Office Block */}
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border">
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
                          <div className="text-muted-foreground text-sm">info@tambuaafrica.com</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kenya Office Block */}
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" /> Kenya Office
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Physical Location</div>
                          <div className="text-muted-foreground text-sm">Plainsview Road, Off Mombasa Road, Nairobi, Kenya</div>
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
                          <div className="text-muted-foreground text-sm">+254 704 548 878</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Email</div>
                          <div className="text-muted-foreground text-sm">info@tambuaafrica.com</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">Working Hours</div>
                      <div className="text-muted-foreground text-sm">Mon - Sat: 8:00 AM - 6:00 PM EAT</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-primary text-primary-foreground">
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
              </div>

              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-5">
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
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-6 text-base font-semibold disabled:opacity-70">
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
