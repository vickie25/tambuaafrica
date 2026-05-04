import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plane, ShieldCheck, ThermometerSun, Wallet, Camera, HelpCircle } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const TravelInfo = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-primary text-white">
          <div className="absolute inset-0 z-0 opacity-20">
            <OptimizedImage 
              src="/images/maasai-mara-authentic.webp"
              fallbackSrc={fallbackSafariImage("travel-info-hero")}
              alt="Travel Info Background" 
              className="w-full h-full object-cover"
              priority 
            />
          </div>
          <div className="container-wide relative z-10 mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Essential Travel Info</h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto text-white/90">
              Everything you need to know before embarking on your unforgettable Kenyan Safari.
            </p>
          </div>
        </div>

        <section className="border-b border-border bg-muted/25 py-10">
          <div className="container-wide mx-auto grid gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Before you fly</p>
              <p className="mt-2 text-sm text-muted-foreground">
                eTA rules, passport validity, and yellow-fever notes. Start here so immigration stays smooth.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">On safari</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Packing colours, layers for dawn drives, and soft bags for light aircraft. Small details that matter.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Money & phones</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cash vs card, tipping culture, and local SIM tips so you stay connected in the bush and on the coast.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <main className="container-wide mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-6" defaultValue="item-1">
              
              {/* Entry Requirements */}
              <AccordionItem value="item-1" className="border rounded-xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Plane className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Visa & Entry Requirements</h3>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Kenya eTA and Passport rules</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>Electronic Travel Authorisation (eTA):</strong> Kenya has shifted to a visa-free regime for global travellers! However, all visitors MUST apply for an eTA online at least 3 days prior to travel.</li>
                    <li><strong>Passport Validity:</strong> Your passport must be valid for at least 6 months from your date of arrival and contain at least two blank pages.</li>
                    <li><strong>Return Tickets:</strong> You may be asked to show proof of a return or onward flight ticket upon arrival.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Health */}
              <AccordionItem value="item-2" className="border rounded-xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Health & Vaccinations</h3>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Medical prep for the bush</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>Yellow Fever:</strong> A certificate is mandatory if arriving from a Yellow Fever endemic country. Check current WHO guidelines before traveling.</li>
                    <li><strong>Malaria:</strong> Kenya is a malaria zone, particularly on the coast and low-lying safari areas. Consult your doctor regarding Anti-Malaria prophylaxis.</li>
                    <li><strong>Water:</strong> We recommend drinking only bottled or properly filtered water. Avoid ice in drinks outside of premium lodges.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Packing */}
              <AccordionItem value="item-3" className="border rounded-xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">What to Pack</h3>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Clothing and gear checklist</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>Clothing Colors:</strong> Stick to neutral tones (khaki, olive, brown, grey) to blend into the environment and avoid attracting Tsetse flies (who love blue/black).</li>
                    <li><strong>Layers are Key:</strong> Early morning game drives are surprisingly cold! Bring a warm fleece or jacket. Days heat up quickly, so layer with breathable fabrics.</li>
                    <li><strong>Footwear:</strong> Comfortable, closed walking shoes/boots for the bush, and sandals for lounging at the lodge.</li>
                    <li><strong>Gear:</strong> High-SPF sunscreen, wide-brimmed hat, insect repellent, binoculars, and a good camera with a telephoto lens if you have one.</li>
                    <li><strong>Luggage limits:</strong> If taking a light aircraft (fly-in safari), luggage is strictly limited to 15kg (33lbs) in soft-sided bags.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Climate */}
              <AccordionItem value="item-4" className="border rounded-xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ThermometerSun className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Climate & Best Time to Visit</h3>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Understanding Kenya's seasons</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>July to October:</strong> The peak season, bringing the spectacular Great Wildebeest Migration to the Maasai Mara. Dry weather means excellent wildlife visibility.</li>
                    <li><strong>January to February:</strong> A short dry season characterized by hot days. It's an excellent time for safaris with fewer crowds than July-August.</li>
                    <li><strong>April to May (The Green Season):</strong> The 'long rains' transform the bush into a lush, emerald paradise. It's the primary birthing season for many animals and fantastic for photography, with far lower rates!</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Currency */}
              <AccordionItem value="item-5" className="border rounded-xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Currency & Tipping</h3>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Money matters on Safari</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>Currency:</strong> The official currency is the Kenyan Shilling (KES), but US Dollars (issued after 2009) are widely accepted at lodges and camps. Note that change may be given in Shillings.</li>
                    <li><strong>Credit Cards:</strong> Visa and Mastercard are accepted at major hotels and lodges. Tell your bank you are travelling so your card isn't blocked.</li>
                    <li><strong>Tipping Etiquette:</strong> Tipping is customary but not obligatory. As a rough guide: $10-15 per person per day for your driver/guide, and $5-10 per day for general lodge staff (placed in the communal tip box).</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Culture */}
              <AccordionItem value="item-6" className="border rounded-xl px-6 bg-card shadow-sm">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Culture & Etiquette</h3>
                      <p className="text-sm text-muted-foreground font-normal mt-1">Respecting local traditions</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>Photography:</strong> Always ask for permission before taking photographs of local people (Maasai, Samburu, etc.). Sometimes a small fee or tip is expected.</li>
                    <li><strong>Swahili Basics:</strong> Learning a few words goes a long way! <br/><br/>
                      <span className="italic px-3 border-l-2 border-primary ml-2 inline-block">
                        Jambo (Hello) • Habari (How are you?) • Mzuri (Good) • Asante (Thank you) • Karibu (Welcome/You're welcome) • Hakuna Matata (No worries)
                      </span>
                    </li>
                    <li><strong>Dress Code:</strong> While safari gear is fine in the bush, conservative dress covering knees and shoulders is appreciated in coastal towns (like Lamu) or rural Kenyan villages.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default TravelInfo;
