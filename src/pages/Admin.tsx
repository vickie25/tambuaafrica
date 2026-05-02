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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const adminTabs = [
  {
    id: "bookings",
    label: "Bookings",
    description: "Review reservations, customer details, and booking status changes.",
  },
  {
    id: "carousel",
    label: "Carousel",
    description: "Manage homepage hero images, activities, and gallery visuals.",
  },
  {
    id: "safaris",
    label: "Safaris",
    description: "Add, edit, and sync safari packages shown on the website.",
  },
  {
    id: "destinations",
    label: "Destinations",
    description: "Maintain destination content, imagery, and listing details.",
  },
  {
    id: "lodges",
    label: "Lodges",
    description: "Update destination lodge options and supporting media assets.",
  },
  {
    id: "blogs",
    label: "Blogs",
    description: "Publish blog content and keep editorial entries up to date.",
  },
  {
    id: "messages",
    label: "Messages",
    description: "Track inquiries, customer messages, and follow-up activity.",
  },
  {
    id: "insights",
    label: "Insights",
    description: "View summary metrics and AI-driven website recommendations.",
  },
  {
    id: "health",
    label: "Health",
    description: "Check database, storage, and admin environment diagnostics.",
  },
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
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Tambua Africa
        </p>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {userEmail || "Administrator"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {adminTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === "messages" && unreadCount > 0 ? (
                <span
                  className={`flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <Button variant="outline" onClick={onSignOut} className="w-full justify-start rounded-2xl">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
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
        <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-muted/20">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <main className="min-w-0 flex-1 pb-6">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-[28px] border border-border bg-card p-4 shadow-sm">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="shrink-0 rounded-2xl" aria-label="Open admin menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Admin Navigation</SheetTitle>
                    <SheetDescription>
                      Switch between admin sections and account actions.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6">
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

              <div className="min-w-0 flex-1 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Admin Panel
                </p>
                <h1 className="mt-1 text-lg font-bold text-foreground">Tambua Africa</h1>
              </div>
            </div>

            <div className="mb-6 rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-sm font-semibold text-accent">{activeTabMeta.label}</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Admin Dashboard
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                {activeTabMeta.description}
              </p>
            </div>

            <Suspense
              fallback={
                <div className="flex justify-center rounded-[28px] border border-border bg-card p-12 shadow-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              }
            >
              {activeTab === "carousel" && (
                <ErrorBoundary>
                  <AdminCarousel />
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
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-8 w-8 text-accent" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
                        <p className="text-sm text-muted-foreground">Confirmed</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-secondary" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          ${(stats.revenue / 100).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-accent" />
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search bookings..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="rounded-xl pl-10"
                    />
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
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

                <div className="overflow-hidden rounded-2xl border border-border bg-card">
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
                                : "—"}
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

        <Dialog
          open={!!selectedBooking}
          onOpenChange={(open) => {
            if (!open) setSelectedBooking(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
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
      </div>
    </PageTransition>
  );
};

export default Admin;
