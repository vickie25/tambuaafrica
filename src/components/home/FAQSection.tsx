import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionHeader from "@/components/layout/SectionHeader";

const faqs = [
  {
    q: "What is the best time to visit East Africa for a safari?",
    a: "The dry seasons (June to October and January to March) are ideal for wildlife viewing across Kenya and Tanzania. The Great Migration moves through the Serengeti and Masai Mara from July to October. Uganda and Rwanda are great year round for gorilla trekking, with drier months (June to September, December to February) preferred.",
  },
  {
    q: "Do I need visas for multiple East African countries?",
    a: "Kenya, Rwanda, and Uganda offer an East Africa Tourist Visa that covers all three countries for $100. Tanzania requires a separate visa. Ethiopia and South Africa also have their own visa processes. We'll guide you through all entry requirements for your itinerary.",
  },
  {
    q: "What vaccinations do I need for East Africa?",
    a: "Yellow fever vaccination is required for entry into most East African countries. We recommend consulting your doctor about malaria prophylaxis, Hepatitis A & B, and Typhoid vaccinations at least 6 weeks before travel.",
  },
  {
    q: "What should I pack for an African safari?",
    a: "Pack lightweight, neutral-colored clothing (khaki, olive, tan), comfortable walking shoes, a wide-brimmed hat, sunscreen, binoculars, and a good camera. Evenings can be cool at altitude, so bring a warm layer. For gorilla treks, include waterproof gear and sturdy hiking boots.",
  },
  {
    q: "Can I combine multiple countries in one trip?",
    a: "Absolutely! Multi-country itineraries are our specialty. Popular combinations include Kenya to Tanzania (Mara & Serengeti), Uganda to Rwanda (gorilla trekking), and Tanzania to Zanzibar (bush to beach). We handle all cross-border logistics seamlessly.",
  },
  {
    q: "Are your safaris suitable for children?",
    a: "Yes! We offer family-friendly safari packages with age-appropriate activities. Children aged 5+ can join most game drives. We also arrange private vehicle safaris for families with younger children.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Free cancellation up to 30 days before departure for a full refund. Cancellations 15-29 days before receive a 50% refund. Within 14 days, no refund is available. We recommend travel insurance.",
  },
  {
    q: "What is included in the safari price?",
    a: "Our prices typically include accommodation, meals as specified, park entry fees, game drives with professional guides, airport transfers, and transport in a 4x4 safari vehicle. International flights and visa fees are not included.",
  },
  {
    q: "Can Tambua Africa help with flights, buses, or transfers?",
    a: "Yes. We arrange air and road ticketing where it fits your itinerary, plus private road transfers and coordinated air hops when available. Share your arrival details and park schedule on the Contact page or WhatsApp and we’ll line everything up with your safari dates.",
  },
  {
    q: "Do you book lodges and hotels outside of packaged safaris?",
    a: "Absolutely. We help clients book lodges, camps, and city hotels across East Africa, matched to park location, budget, and style. We’ll suggest options and handle reservations as part of your wider trip plan.",
  },
];

const FAQSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-background" ref={ref}>
      <div className="container-wide mx-auto">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Everything you need to know before planning your safari adventure."
        />

        <div
          className={`max-w-3xl mx-auto transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-5 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold text-sm sm:text-base hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
