import { useSafaris } from "@/hooks/useSafaris";
import { useDestinations } from "@/hooks/useDestinations";
import { useAdminStats } from "@/hooks/useAdminBookings";
import { LineChart, TrendingUp, Users, Activity, Loader2 } from "lucide-react";

export const AdminInsights = () => {
  const { data: safaris = [] } = useSafaris();
  const { data: destinations = [] } = useDestinations();
  const { data: stats = { revenue: 0, inquiriesCount: 0 }, isLoading: statsLoading } = useAdminStats();

  const firstDestinationName = destinations.length > 0 ? destinations[0].name : "None yet";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Numbers at a glance</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Pulled from what is in Supabase right now. If something looks off, check Safaris, Destinations, or Inbox.
          </p>
        </div>
        {statsLoading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" /> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">First destination</span>
          </div>
          <p className="text-base font-semibold text-foreground">{firstDestinationName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Whatever sits first in your list today.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
            <LineChart className="h-4 w-4" />
            <span className="text-xs font-medium">Confirmed revenue</span>
          </div>
          <p className="text-base font-semibold tabular-nums text-foreground">${stats.revenue.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">Sum of confirmed booking amounts.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Inbox</span>
          </div>
          <p className="text-base font-semibold tabular-nums text-foreground">{stats.inquiriesCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Messages waiting in enquiries.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-1.5 flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium">Safari rows</span>
          </div>
          <p className="text-base font-semibold tabular-nums text-foreground">{safaris.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Packages the site can show.</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-foreground">Worth doing when you have a minute</h3>
        <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
          <li className="border-l-2 border-border pl-3">
            <span className="font-medium text-foreground">Cultural trips:</span> if you sell them, give them the same
            care as wildlife: clear title, one strong photo, highlights people actually read.
          </li>
          <li className="border-l-2 border-border pl-3">
            <span className="font-medium text-foreground">Photos:</span> very large files hurt mobile. Compress before
            upload when you can.
          </li>
          <li className="border-l-2 border-border pl-3">
            <span className="font-medium text-foreground">Inbox:</span> a quick reply usually beats tweaking numbers here.
          </li>
        </ul>
      </div>
    </div>
  );
};
