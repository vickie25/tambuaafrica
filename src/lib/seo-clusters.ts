/**
 * Topic clusters for internal linking (pillar → cluster pages).
 * Supports informational vs transactional intent mapping.
 */

export type ClusterLink = {
  href: string;
  label: string;
  intent: "informational" | "transactional";
};

export type TopicCluster = {
  pillar: ClusterLink;
  clusters: ClusterLink[];
};

/** Central guides that pass authority to related commercial pages. */
export const SEO_TOPIC_CLUSTERS: TopicCluster[] = [
  {
    pillar: {
      href: "/safaris",
      label: "Kenya safari packages",
      intent: "transactional",
    },
    clusters: [
      { href: "/safaris/2-days-masai-mara", label: "2-day Maasai Mara safari", intent: "transactional" },
      { href: "/safaris/4-days-wildebeest-migration", label: "Great Migration safari", intent: "transactional" },
      { href: "/destinations", label: "Safari destinations", intent: "informational" },
      { href: "/travel-info", label: "Safari travel planning guide", intent: "informational" },
    ],
  },
  {
    pillar: {
      href: "/travel-info",
      label: "Kenya safari travel guide",
      intent: "informational",
    },
    clusters: [
      { href: "/blog", label: "Safari blog & tips", intent: "informational" },
      { href: "/gallery", label: "Wildlife photo gallery", intent: "informational" },
      { href: "/services/transfers", label: "Airport & lodge transfers", intent: "transactional" },
      { href: "/contact", label: "Request a custom quote", intent: "transactional" },
    ],
  },
  {
    pillar: {
      href: "/services",
      label: "Safari support services",
      intent: "transactional",
    },
    clusters: [
      { href: "/services/ticketing", label: "Flights & coach tickets", intent: "transactional" },
      { href: "/services/lodges-camps", label: "Lodge & camp booking", intent: "transactional" },
      { href: "/services/transfers", label: "Private transfers", intent: "transactional" },
    ],
  },
];

export function clustersForPath(pathname: string): TopicCluster | undefined {
  return SEO_TOPIC_CLUSTERS.find(
    (c) => c.pillar.href === pathname || c.clusters.some((l) => l.href === pathname),
  );
}
