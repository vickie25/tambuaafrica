import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Search, Users, Calendar, DollarSign, BarChart3, LogOut, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminBookings, useAdminProfiles, useUnreadInquiriesCount, type AdminBooking } from "@/hooks/useAdminBookings";
// Lazy load admin components for performance (Handle named exports)
const AdminSafaris = lazy(() => import("@/components/admin/AdminSafaris").then(m => ({ default: m.AdminSafaris })));
const AdminDestinations = lazy(() => import("@/components/admin/AdminDestinations").then(m => ({ default: m.AdminDestinations })));
const AdminBlogs = lazy(() => import("@/components/admin/AdminBlogs").then(m => ({ default: m.AdminBlogs })));
const AdminInsights = lazy(() => import("@/components/admin/AdminInsights").then(m => ({ default: m.AdminInsights })));
const AdminInquiries = lazy(() => import("@/components/admin/AdminInquiries").then(m => ({ default: m.AdminInquiries })));
const AdminHealth = lazy(() => import("@/components/admin/AdminHealth").then(m => ({ default: m.AdminHealth })));
const AdminCarousel = lazy(() => import("@/components/admin/AdminCarousel").then(m => ({ default: m.AdminCarousel })));

import ErrorBoundary from "@/components/layout/ErrorBoundary";
import SuspenseFallback from "@/components/layout/SuspenseFallback";


const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const Admin = () => {
  const { user, signOut, loading: authLoading, isAdmin: isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  // Use the new synchronized hooks
  const { data: bookingsData = [], isLoading: bookingsLoading } = useAdminBookings();
  const { data: unreadCount = 0 } = useUnreadInquiriesCount();
  
  const userIds = [...new Set(bookingsData.map((b) => b.user_id))];
  const { data: profiles = {} } = useAdminProfiles(userIds);

  const checkAdminStatus = useCallback(async () => {
    // If already determined to be admin from AuthContext, skip the check
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
        // Final fallback check
        if (user?.email?.toLowerCase() === "tambuaafrica@gmail.com") {
          setIsAdmin(true);
        } else {
          navigate("/dashboard");
          return;
        }
      }
      setIsAdmin(true);
    } catch (err) {
      console.warn("Admin check failed:", err);
      // On error, use email fallback
      if (user?.email?.toLowerCase() === "tambuaafrica@gmail.com") {
        setIsAdmin(true);
      } else {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Admin useEffect - authLoading:", authLoading, "user:", user?.email);

    if (!authLoading && !user) {
      console.log("No user, navigating to login");
      navigate("/login");
    } else if (user) {
      console.log("User found:", user.email);
      // Immediately allow tambuaafrica@gmail.com without any checks
      if (user.email?.toLowerCase() === "tambuaafrica@gmail.com") {
        console.log("Allowing tambuaafrica@gmail.com as admin");
        setIsAdmin(true);
        setLoading(false);
      } else if (isSuperAdmin) {
        console.log("Allowing isSuperAdmin");
        // Skip database check if already determined to be admin
        setIsAdmin(true);
        setLoading(false);
      } else {
        console.log("Checking admin status for other user");
        // Check admin status for other users
        checkAdminStatus();
      }
    }
  }, [user, authLoading, checkAdminStatus, navigate, isSuperAdmin]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("bookings")
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      .update({ status: newStatus as any, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) toast.error("Could not update status");
    else {
      toast.success(`Booking ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) toast.error("Could not delete booking");
    else {
      toast.success("Booking deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    }
  };

  const filteredBookings = bookingsData.filter((b) => {
    const matchesSearch = b.safari_title.toLowerCase().includes(search.toLowerCase()) ||
      (profiles[b.user_id]?.full_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookingsData.length,
    confirmed: bookingsData.filter((b) => b.status === "confirmed").length,
    revenue: bookingsData.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.total_amount, 0),
    pending: bookingsData.filter((b) => b.status === "pending").length,
  };

  // Only show loading on initial auth check, not on data fetches (which have their own timeouts)
  if (authLoading || loading) {
    return (
      <PageTransition>
        <Navbar />
        <SuspenseFallback />
      </PageTransition>
    );
  }

  // Always allow tambuaafrica@gmail.com, otherwise check admin status
  if (user?.email?.toLowerCase() !== "tambuaafrica@gmail.com" && !isAdmin && !isSuperAdmin) return null;

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleSignOut} className="rounded-xl">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>

          <div className="flex gap-2 mb-8 border-b border-border pb-px overflow-x-auto whitespace-nowrap scrollbar-hide">
            {["bookings", "carousel", "safaris", "destinations", "blogs", "messages", "insights", "health"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm capitalize border-b-2 transition-colors ${
                  activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "messages" && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full animate-pulse font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent"/></div>}>
            {activeTab === "carousel" && <ErrorBoundary><AdminCarousel /></ErrorBoundary>}
            {activeTab === "safaris" && <ErrorBoundary><AdminSafaris /></ErrorBoundary>}
            {activeTab === "destinations" && <ErrorBoundary><AdminDestinations /></ErrorBoundary>}
            {activeTab === "blogs" && <ErrorBoundary><AdminBlogs /></ErrorBoundary>}
            {activeTab === "messages" && <ErrorBoundary><AdminInquiries /></ErrorBoundary>}
            {activeTab === "insights" && <ErrorBoundary><AdminInsights /></ErrorBoundary>}
            {activeTab === "health" && <ErrorBoundary><AdminHealth /></ErrorBoundary>}
          </Suspense>

          {activeTab === "bookings" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">${(stats.revenue / 100).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] rounded-xl">
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

          {/* Bookings Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Safari</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Guests</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-4">
                        <p className="text-sm font-medium text-foreground">{profiles[booking.user_id]?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{profiles[booking.user_id]?.phone || ""}</p>
                      </td>
                      <td className="p-4 text-sm text-foreground">{booking.safari_title}</td>
                      <td className="p-4 text-sm text-muted-foreground">{booking.preferred_date}</td>
                      <td className="p-4 text-sm text-muted-foreground">{booking.guests}</td>
                      <td className="p-4 text-sm text-foreground">{booking.total_amount > 0 ? `$${(booking.total_amount / 100).toLocaleString()}` : "—"}</td>
                      <td className="p-4">
                        <Badge className={statusColors[booking.status] || "bg-muted text-muted-foreground"}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Select value={booking.status} onValueChange={(v) => updateStatus(booking.id, v)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteBooking(booking.id)}>
                            <Trash2 className="w-4 h-4" />
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
          </>)}
        </div>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-medium">Customer</p>
                  <p className="text-foreground">{profiles[selectedBooking.user_id]?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Phone</p>
                  <p className="text-foreground">{profiles[selectedBooking.user_id]?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Safari</p>
                  <p className="text-foreground">{selectedBooking.safari_title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Date</p>
                  <p className="text-foreground">{selectedBooking.preferred_date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Guests</p>
                  <p className="text-foreground">{selectedBooking.guests}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Amount</p>
                  <p className="text-foreground">${(selectedBooking.total_amount / 100).toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground font-medium text-sm mb-1">Status</p>
                <Badge className={statusColors[selectedBooking.status]}>
                  {selectedBooking.status}
                </Badge>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-muted-foreground font-medium text-sm mb-1">Booking ID</p>
                <code className="text-xs bg-muted p-1 rounded font-mono">{selectedBooking.id}</code>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </PageTransition>
  );
};

export default Admin;
