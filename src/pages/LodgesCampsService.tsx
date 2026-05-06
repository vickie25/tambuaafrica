import { Link } from "react-router-dom";
import { ServicePageLayout } from "@/components/services/ServicePageLayout";
import OptimizedImage from "@/components/ui/optimized-image";
import { fallbackLodgeImage } from "@/lib/remote-media-fallbacks";
import { useSiteMarketingBlock } from "@/hooks/useSiteMarketingBlocks";
import { useLodgesServiceShowcaseCards } from "@/hooks/useLodgesServiceShowcase";
import { SITE_MARKETING_IDS } from "@/lib/site-marketing-defaults";

const HERO_IMAGE_BASE = "https://images.unsplash.com/photo-1566073771259-6a8506099945";

const LodgesCampsService = () => {
  const { data: hero } = useSiteMarketingBlock(SITE_MARKETING_IDS.lodgesServiceHero);
  const { cards } = useLodgesServiceShowcaseCards();

  return (
    <ServicePageLayout
      title={hero.headline}
      eyebrow={hero.eyebrow}
      subtitle={hero.body}
      heroImage={HERO_IMAGE_BASE}
      heroFallback={fallbackLodgeImage("lodges-service-hero")}
      heroAlt="Safari lodge pool overlooking the bush"
      ctaTopic="lodges"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
        <p className="text-base leading-relaxed">
          You do not need to chase availability across dozens of inboxes. Share your park wish-list (for example Masai Mara,
          Amboseli, Tsavo, Samburu, Lakes Nakuru and Naivasha, Laikipia, or the coast), travel dates, party size, and what
          matters most, such as family interconnecting rooms, honeymoon privacy, walking safaris, swimming pool, and all-inclusive meals,
          or conservancy access. We shortlist Kenyan properties that fit, hold space where possible, and issue confirmations
          in line with each supplier&apos;s payment rules.
        </p>
        <p className="text-base leading-relaxed">
          This service stands alone or bolts onto our safari packages: many clients ask us to swap lodge tiers mid-trip,
          add a Nairobi night before an early Wilson departure, or finish on the coast after bush nights.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-foreground">What we need to move quickly</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <li>Rough dates (flexibility by a day or two helps in peak season)</li>
          <li>Number of adults, children, and ages (child policies vary by camp)</li>
          <li>Budget band per night or for the whole land segment</li>
          <li>Style: classic lodge, mobile-style tented camp, ultra-luxury, or mixed</li>
          <li>Any mobility, dietary, or celebration notes we should flag to properties</li>
        </ul>
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground">Safari lodges, tented camps & campsites</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Kenya&apos;s inventory ranges from small seasonal tented camps inside conservancies to large lodges on the park
          rim, plus public and private campsites for adventurous or budget itineraries. The grid below lists{" "}
          <strong className="text-foreground">illustrative properties and areas</strong> travellers often ask us to book, and we
          work with many more and final choice is always yours. Names are shown as common planning references; availability
          and rates change by season.
        </p>
      </div>

      <ul className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((stay) => {
          const primary = stay.image_url?.trim() || fallbackLodgeImage(stay.id);
          return (
            <li
              key={stay.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-[5/3]">
                <OptimizedImage
                  src={primary}
                  fallbackSrc={fallbackLodgeImage(`${stay.id}-alt`)}
                  alt={stay.name}
                  className="h-full w-full object-cover"
                  width={640}
                  height={384}
                  quality={68}
                  fetchPriority="low"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  rootMargin="80px"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                  {stay.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">{stay.area}</p>
                <h3 className="mt-1 text-lg font-bold text-foreground">{stay.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">{stay.note}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">
        Images are representative visuals where we do not host a live property photo; your quote will reference the actual
        property media and inclusions.
      </p>

      <div className="mx-auto mt-16 grid max-w-5xl gap-8 rounded-2xl border border-dashed border-border bg-muted/20 p-6 sm:grid-cols-2 sm:p-10">
        <div>
          <h3 className="text-lg font-bold text-foreground">Campsites vs tented camps</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Tented camps</strong> on safari are usually full-service, with ensuite tents,
            meals, and guided drives. <strong className="text-foreground">Campsites</strong> (for example near Lake
            Naivasha or in Hell&apos;s Gate) are better for self-contained adventure segments: we help secure permits and
            site fees where applicable and pair them with support vehicles or guides when you need them.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">City & coast hotels</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We also book <strong className="text-foreground">Nairobi</strong> and <strong className="text-foreground">
              Mombasa / Diani
            </strong>{" "}
            nights around flights and beach extensions, useful when Wilson Airport or the SGR coach is part of your plan.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex flex-wrap justify-center gap-4">
        <Link
          to="/destinations"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Open Destinations & lodge browser
        </Link>
        <span className="hidden text-muted-foreground sm:inline">·</span>
        <Link
          to="/contact?topic=lodges"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Send a lodge & camp brief
        </Link>
      </div>
    </ServicePageLayout>
  );
};

export default LodgesCampsService;
