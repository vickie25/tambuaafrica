import { ServicePageLayout } from "@/components/services/ServicePageLayout";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const segments = [
  {
    title: "Airport meet & greet",
    text: "Nairobi Jomo Kenyatta (NBO) and Wilson (WIL) pickups with clear signage, luggage help, and handover to your hotel or domestic terminal. We factor traffic buffers for international arrivals.",
  },
  {
    title: "Road transfers between parks & cities",
    text: "Private 4×4 or van transfers on paved and bush roads, including Nairobi to Naivasha, Mara gate transfers, Amboseli routing, Tsavo links, and multi-day driver guides when your itinerary is entirely overland.",
  },
  {
    title: "Scheduled air hops on the ground side",
    text: "We do not fly the aircraft, but we coordinate pick-ups and drop-offs with airstrip times, camp hosts, and pilot briefings so you never miss a connection after a bush landing.",
  },
  {
    title: "Park timings & gate logistics",
    text: "Kenyan parks have strict gate hours. We schedule departures from lodges so you maximise game viewing without risking late fines or missed flights.",
  },
];

const TransfersService = () => {
  return (
    <ServicePageLayout
      title="Road & air transfers"
      eyebrow="Coordinated door-to-door"
      subtitle="Private vehicles, airport meet-and-greets, and airstrip handovers planned around your tickets and lodge check-ins, so every handoff in Kenya feels seamless."
      heroImage="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=80"
      heroFallback={fallbackSafariImage("transfers-service-hero")}
      heroAlt="Safari vehicle on a savannah road"
      ctaTopic="transfers"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
        <p className="text-base leading-relaxed">
          Transfers are where small mistakes become big stress, such as a wrong terminal, missing airstrip transfer, or a driver who
          does not know camp radio protocols. Tambua schedules each segment with vetted partners, shares driver contacts where
          appropriate, and keeps your lodge or camp informed of delays when traffic or weather intervene.
        </p>
        <p className="text-base leading-relaxed">
          Whether you are flying between reserves or driving the whole circuit, we align{" "}
          <strong className="text-foreground">vehicle type, child seats if needed</strong>, and{" "}
          <strong className="text-foreground">language preferences</strong> with your party profile.
        </p>
      </div>

      <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
        {segments.map((s) => (
          <li key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">What to send us</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground sm:text-base">
          <li>Flight numbers and terminals (or expected arrival time if not ticketed yet)</li>
          <li>Full lodge or camp names with reservation holder name</li>
          <li>Party size, luggage count, and any mobility considerations</li>
          <li>Whether you need a stocked vehicle (water, basic snacks) for long road legs</li>
        </ul>
      </div>
    </ServicePageLayout>
  );
};

export default TransfersService;
