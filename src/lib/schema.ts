/**
 * JSON-LD structured data builders (Schema.org).
 * @see https://schema.org
 */

import { SITE_ORIGIN, SITE_NAME, LOGO_URL, TRAVEL_AGENCY_JSON_LD } from "@/lib/seo";

export type FaqItem = { question: string; answer: string };

export function buildFaqPageJsonLd(faqs: FaqItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url: pageUrl,
  };
}

export function buildBlogPostingJsonLd(post: {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category?: string;
  readTime?: string;
}) {
  const pageUrl = `${SITE_ORIGIN}/blog/${post.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image.startsWith("http") ? post.image : `${SITE_ORIGIN}${post.image}`,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    articleSection: post.category,
    url: pageUrl,
  };
}

export function buildTouristTripJsonLd(safari: {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  location?: string;
  duration?: string;
}) {
  const pageUrl = `${SITE_ORIGIN}/safaris/${safari.id}`;
  const image = safari.image.startsWith("http") ? safari.image : `${SITE_ORIGIN}${safari.image}`;
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: safari.title,
    description: safari.description,
    touristType: "Safari",
    image,
    itinerary: safari.location,
    duration: safari.duration,
    provider: {
      "@type": "TravelAgency",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    ...(safari.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: safari.price,
            priceCurrency: "USD",
            url: pageUrl,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    url: pageUrl,
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_ORIGIN,
    publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/safaris?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Re-export travel agency as the canonical LocalBusiness / organization node. */
export function buildOrganizationJsonLd() {
  return {
    ...TRAVEL_AGENCY_JSON_LD,
    "@id": `${SITE_ORIGIN}/#organization`,
    "@type": ["TravelAgency", "LocalBusiness"],
    geo: {
      "@type": "GeoCoordinates",
      latitude: -1.319167,
      longitude: 36.821945,
    },
    hasMap: "https://maps.google.com/?q=Tambua+Africa+Tours+Nairobi",
  };
}

export function buildBreadcrumbJsonLdFromTrail(
  trail: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path}`,
    })),
  };
}
