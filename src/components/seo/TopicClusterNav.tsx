import { Link, useLocation } from "react-router-dom";
import { clustersForPath } from "@/lib/seo-clusters";
import { ArrowRight } from "lucide-react";

/**
 * Contextual internal links for pillar/cluster SEO architecture.
 */
const TopicClusterNav = ({ className = "" }: { className?: string }) => {
  const { pathname } = useLocation();
  const cluster = clustersForPath(pathname);
  if (!cluster) return null;

  const related = [
    ...(cluster.pillar.href !== pathname ? [cluster.pillar] : []),
    ...cluster.clusters.filter((l) => l.href !== pathname),
  ].slice(0, 5);

  if (!related.length) return null;

  return (
    <nav
      className={`rounded-2xl border border-border bg-muted/30 p-6 ${className}`}
      aria-label="Related safari topics"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">Explore related topics</p>
      <ul className="flex flex-col gap-2">
        {related.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="group flex items-center justify-between gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              <span>
                {link.label}
                <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {link.intent === "transactional" ? "Book" : "Guide"}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TopicClusterNav;
