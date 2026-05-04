import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import PageTransition from "@/components/layout/PageTransition";
import Navbar from "@/components/layout/Navbar";
import { Helmet } from "react-helmet-async";
import { SITE_NAME } from "@/lib/seo";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import SuspenseFallback from "@/components/layout/SuspenseFallback";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Eye,
  Loader2,
  LogOut,
  Menu,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminBookings,
  useAdminProfiles,
  useUnreadInquiriesCount,
  type AdminBooking,
} from "@/hooks/useAdminBookings";
import { isAdminMailbox } from "@/lib/admin-email";

const AdminSafaris = lazy(() =>
  import("@/components/admin/AdminSafaris").then((m) => ({ default: m.AdminSafaris })),
);
const AdminDestinations = lazy(() =>
  import("@/components/admin/AdminDestinations").then((m) => ({ default: m.AdminDestinations })),
);
const AdminBlogs = lazy(() =>
  import("@/components/admin/AdminBlogs").then((m) => ({ default: m.AdminBlogs })),
);
const AdminInsights = lazy(() =>
  import("@/components/admin/AdminInsights").then((m) => ({ default: m.AdminInsights })),
);
const AdminInquiries = lazy(() =>
  import("@/components/admin/AdminInquiries").then((m) => ({ default: m.AdminInquiries })),
);
const AdminHealth = lazy(() =>
  import("@/components/admin/AdminHealth").then((m) => ({ default: m.AdminHealth })),
);
const AdminCarousel = lazy(() =>
  import("@/components/admin/AdminCarousel").then((m) => ({ default: m.AdminCarousel })),
);
const AdminLodges = lazy(() =>
  import("@/components/admin/AdminLodges").then((m) => ({ default: m.AdminLodges })),
);
const AdminSiteCopy = lazy(() =>
  import("@/components/admin/AdminSiteCopy").then((m) => ({ default: m.AdminSiteCopy })),
);

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const adminTabs = [
  { id: "bookings", label: "Bookings", hint: "Look up reservations and change status." },
  { id: "carousel", label: "Homepage images", hint: "Hero, activities, and gallery slides." },
  { id: "site_copy", label: "Home & services text", hint: "Home services strip and lodges page hero." },
  { id: "safaris", label: "Safaris", hint: "Packages and prices on the site." },
  { id: "destinations", label: "Destinations", hint: "Park and region pages." },
  { id: "lodges", label: "Lodges & camps", hint: "Per-destination lodge list in Supabase." },
  { id: "blogs", label: "Blog", hint: "Posts and drafts." },
  { id: "messages", label: "Inbox", hint: "Contact form and enquiries." },
  { id: "insights", label: "At a glance", hint: "Quick counts from the live data." },
  { id: "health", label: "System check", hint: "Database and storage smoke test." },
] as const;

type AdminTab = (typeof adminTabs)[number]["id"];

interface AdminSidebarContentProps {
  activeTab: AdminTab;
  unreadCount: number;
  onSelectTab: (tab: AdminTab) => void;
  onSignOut: () => void;
  userEmail?: string | null;
}

const AdminSidebarContent = ({
  activeTab,
  unreadCount,
  onSelectTab,
  onSignOut,
  userEmail,
}: AdminSidebarContentProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className="px-1 pb-4">
        <p className="text-sm font-semibold text-foreground">Tambua</p>
        <p className="mt-0.5 break-all text-xs text-muted-foreground" title={userEmail || undefined}>
          {userEmail || "Signed in"}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Admin sections">
        {adminTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              title={tab.hint}
              onClick={() => onSelectTab(tab.id)}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === "messages" && unreadCount > 0 ? (
                <span
                  className={`flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                    isActive ? "bg-primary/15 text-primary" : "bg-destructive/90 text-destructive-foreground"
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <Button variant="ghost" size="sm" onClick={onSignOut} className="w-full justify-start px-2.5 text-muted-foreground hover:text-foreground">
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, signOut, loading: authLoading, isAdmin: isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { data: bookingsData = [] } = useAdminBookings();
  const { data: unreadCount = 0 } = useUnreadInquiriesCount();

  const userIds = [...new Set(bookingsData.map((booking) => booking.user_id))];
  const { data: profiles = {} } = useAdminProfiles(userIds);

  const checkAdminStatus = useCallback(async () => {
    if (isSuperAdmin) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

      if (error || profile?.role?.toLowerCase() !== "admin") {
        if (isAdminMailbox(user?.email)) {
          setIsAdmin(true);
        } else {
          navigate("/dashboard");
          return;
        }
      }

      setIsAdmin(true);
    } catch (error) {
      console.warn("Admin check failed:", error);

      if (isAdminMailbox(user?.email)) {
        setIsAdmin(true);
      } else {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, navigate, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/admin", {
        replace: true,
        state: { from: { pathname: "/admin" } },
      });
      return;
    }

    if (!user) return;

    if (isAdminMailbox(user.email) || isSuperAdmin) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    checkAdminStatus();
  }, [authLoading, checkAdminStatus, isSuperAdmin, navigate, user]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      .update({ status: newStatus as any, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) {
      toast.error("Could not update status");
      return;
    }

    toast.success(`Booking ${newStatus}`);
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

    if (error) {
      toast.error("Could not delete booking");
      return;
    }

    toast.success("Booking deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
  };

  const filteredBookings = bookingsData.filter((booking) => {
    const matchesSearch =
      booking.safari_title.toLowerCase().includes(search.toLowerCase()) ||
      (profiles[booking.user_id]?.full_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookingsData.length,
    confirmed: bookingsData.filter((booking) => booking.status === "confirmed").length,
    revenue: bookingsData
      .filter((booking) => booking.status === "confirmed")
      .reduce((sum, booking) => sum + booking.total_amount, 0),
    pending: bookingsData.filter((booking) => booking.status === "pending").length,
  };

  const activeTabMeta = adminTabs.find((tab) => tab.id === activeTab) || adminTabs[0];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
  };

  if (authLoading || loading) {
    return (
      <PageTransition>
        <Helmet>
          <title>{`Admin | ${SITE_NAME}`}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-background pt-11">
          <SuspenseFallback />
        </div>
      </PageTransition>
    );
  }

  if (!isAdminMailbox(user?.email) && !isAdmin && !isSuperAdmin) {
    return null;
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{`Admin | ${SITE_NAME}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <div className="min-h-screen bg-background pt-11">
        <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-[1600px] flex-col">
            <header className="sticky top-11 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-sm sm:px-4">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" aria-label="Open sections menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(20rem,88vw)] p-0">
                  <SheetHeader className="border-b border-border px-4 py-3 text-left">
                    <SheetTitle className="text-base">Sections</SheetTitle>
                    <SheetDescription className="text-xs">Choose a screen. Closes after you pick one.</SheetDescription>
                  </SheetHeader>
                  <div className="px-3 py-3">
                    <AdminSidebarContent
                      activeTab={activeTab}
                      unreadCount={unreadCount}
                      onSelectTab={handleSelectTab}
                      onSignOut={handleSignOut}
                      userEmail={user?.email}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <p className="min-w-0 truncate text-right text-sm text-muted-foreground">{activeTabMeta.label}</p>
            </header>

            <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-5">
            <div className="mb-6 border-b border-border pb-5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{activeTabMeta.label}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{activeTabMeta.hint}</p>
            </div>

            <Suspense
              fallback={
                <div className="flex justify-center rounded-lg border border-border bg-card p-10">
                  <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                </div>
              }
            >
              {activeTab === "carousel" && (
                <ErrorBoundary>
                  <AdminCarousel />
                </ErrorBoundary>
              )}
              {activeTab === "site_copy" && (
                <ErrorBoundary>
                  <AdminSiteCopy />
                </ErrorBoundary>
              )}
              {activeTab === "safaris" && (
                <ErrorBoundary>
                  <AdminSafaris />
                </ErrorBoundary>
              )}
              {activeTab === "destinations" && (
                <ErrorBoundary>
                  <AdminDestinations />
                </ErrorBoundary>
              )}
              {activeTab === "lodges" && (
                <ErrorBoundary>
                  <AdminLodges />
                </ErrorBoundary>
              )}
              {activeTab === "blogs" && (
                <ErrorBoundary>
                  <AdminBlogs />
                </ErrorBoundary>
              )}
              {activeTab === "messages" && (
                <ErrorBoundary>
                  <AdminInquiries />
                </ErrorBoundary>
              )}
              {activeTab === "insights" && (
                <ErrorBoundary>
                  <AdminInsights />
                </ErrorBoundary>
              )}
              {activeTab === "health" && (
                <ErrorBoundary>
                  <AdminHealth />
                </ErrorBoundary>
              )}
            </Suspense>

            {activeTab === "bookings" && (
              <>
                <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-7 w-7 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">All bookings</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-7 w-7 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.confirmed}</p>
                        <p className="text-sm text-muted-foreground">Confirmed</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-7 w-7 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-semibold tabular-nums text-foreground">
                          ${(stats.revenue / 100).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">From confirmed</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <Users className="h-7 w-7 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.pending}</p>
                        <p className="text-sm text-muted-foreground">Awaiting action</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search name, safari, phone…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Customer
                          </th>
                          <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Safari
                          </th>
                          <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Guests
                          </th>
                          <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-border hover:bg-muted/20">
                            <td className="p-4">
                              <p className="text-sm font-medium text-foreground">
                                {profiles[booking.user_id]?.full_name || "Unknown"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {profiles[booking.user_id]?.phone || ""}
                              </p>
                            </td>
                            <td className="p-4 text-sm text-foreground">{booking.safari_title}</td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {booking.preferred_date}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{booking.guests}</td>
                            <td className="p-4 text-sm text-foreground">
                              {booking.total_amount > 0
                                ? `$${(booking.total_amount / 100).toLocaleString()}`
                                : "N/A"}
                            </td>
                            <td className="p-4">
                              <Badge className={statusColors[booking.status] || "bg-muted text-muted-foreground"}>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Select
                                  value={booking.status}
                                  onValueChange={(value) => updateStatus(booking.id, value)}
                                >
                                  <SelectTrigger className="h-8 w-[120px] rounded-lg text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-accent"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => deleteBooking(booking.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredBookings.length === 0 && (
                      <div className="p-12 text-center text-muted-foreground">No bookings found</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
          </div>
        </div>

        <Dialog
          open={!!selectedBooking}
          onOpenChange={(open) => {
            if (!open) setSelectedBooking(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking</DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Customer</p>
                    <p className="text-foreground">
                      {profiles[selectedBooking.user_id]?.full_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Phone</p>
                    <p className="text-foreground">{profiles[selectedBooking.user_id]?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Safari</p>
                    <p className="text-foreground">{selectedBooking.safari_title}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Date</p>
                    <p className="text-foreground">{selectedBooking.preferred_date}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Guests</p>
                    <p className="text-foreground">{selectedBooking.guests}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Amount</p>
                    <p className="text-foreground">
                      ${(selectedBooking.total_amount / 100).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-2">
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedBooking.status]}>{selectedBooking.status}</Badge>
                </div>

                <div className="border-t border-border pt-2">
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Booking ID</p>
                  <code className="rounded bg-muted p-1 font-mono text-xs">{selectedBooking.id}</code>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </PageTransition>
  );
};

export default Admin;
