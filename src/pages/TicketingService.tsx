import { ServicePageLayout } from "@/components/services/ServicePageLayout";
import { fallbackSafariImage } from "@/lib/remote-media-fallbacks";

const airBullets = [
  {
    title: "International arrivals",
    text: "Most visitors fly into Jomo Kenyatta International (NBO). We can hold domestic connections in mind when we quote, especially if you are continuing the same day to the coast or a bush airstrip.",
  },
  {
    title: "Domestic airlines & routes",
    text: "Kenya Airways and Jambojet link Nairobi with Mombasa (MBA), Kisumu, Malindi, and other hubs. From Wilson Airport (WIL), scheduled props and charters serve the Masai Mara, Amboseli, Samburu, Tsavo, Lamu, and more, and carriers such as Safarilink and AirKenya are common choices we ticket around your safari timing.",
  },
  {
    title: "Light aircraft baggage",
    text: "Bush hops usually require soft bags and strict weight limits. Tell us your luggage early, and we align tickets with the carrier rules so you are not caught at check-in.",
  },
];

const roadBullets = [
  {
    title: "Long-distance coach",
    text: "Comfortable coaches run key corridors such as Nairobi to Mombasa and Nairobi to Kisumu. Operators like Easy Coach and Mash Poa are widely used; we book seats that match your safari start or SGR connection when that is the better option.",
  },
  {
    title: "Shuttle & cross-border",
    text: "Road shuttles (for example towards Namanga / Arusha) suit some regional itineraries. We coordinate departure points and luggage with your guide handovers.",
  },
  {
    title: "Why book through Tambua",
    text: "We issue tickets in your (or your party lead’s) name as agreed, share e-tickets and reference numbers, and keep road and air segments aligned with lodge check-ins and transfer pickups.",
  },
];

const TicketingService = () => {
  return (
    <ServicePageLayout
      title="Air & road ticketing"
      eyebrow="Booked on your behalf"
      subtitle="We arrange domestic and international flight tickets plus long-distance coach and selected shuttle seats, timed around your safari, coast extension, or independent Kenya trip."
      heroImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"
      heroFallback={fallbackSafariImage("ticketing-service-hero")}
      heroAlt="Aircraft wing above clouds"
      ctaTopic="ticketing"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
        <p className="text-base leading-relaxed">
          You tell us who is travelling, roughly when, and which legs you want us to handle (for example home city to
          Nairobi, Nairobi to the Mara, or Nairobi to Mombasa by road). We search routings that fit your dates, explain fare
          classes where it matters, and book once you approve. Changes and cancellations follow each airline or coach
          company&apos;s rules, and we walk you through the options if plans shift.
        </p>
        <p className="text-base leading-relaxed">
          Ticketing pairs naturally with our{" "}
          <strong className="text-foreground">transfer and lodge teams</strong>: the same itinerary brief keeps Wilson
          departures, lodge road transfers, and checkout times in sync.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Air ticketing</h2>
          <ul className="mt-6 space-y-6">
            {airBullets.map((item) => (
              <li key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Road ticketing</h2>
          <ul className="mt-6 space-y-6">
            {roadBullets.map((item) => (
              <li key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground">Details that speed up your quote</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground sm:text-base">
          <li>Full names exactly as they appear on passports</li>
          <li>Date flexibility (± days) if safari lodges are already fixed</li>
          <li>Preferred cabin or seat notes for long international legs</li>
          <li>Baggage allowances, especially if you are carrying camera gear</li>
          <li>Child ages for airline and coach discounts</li>
        </ul>
      </div>
    </ServicePageLayout>
  );
};

export default TicketingService;
