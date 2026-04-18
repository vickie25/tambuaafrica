import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Users, MapPin, LogOut, Loader2, CreditCard, Download, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import EditBookingModal from "@/components/booking/EditBookingModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSafaris } from "@/hooks/useSafaris";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface Booking {
  id: string;
  safari_id: string;
  safari_title: string;
  preferred_date: string;
  guests: number;
  total_amount: number;
  currency: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const Dashboard = () => {
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa">("card");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const { data: safaris = [] } = useSafaris();

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setBookings(data as Booking[]);
    } catch (error) {
      console.warn("Could not fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const BookingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-2xl border border-border p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  const cancelBooking = async (id: string) => {
    const { error } = await supabase
      .from("bookings")
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      .update({ status: "cancelled" as any, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) toast.error("Could not cancel booking");
    else {
      toast.success("Booking cancelled");
      fetchBookings();
    }
  };

  const downloadReceipt = async (bookingId: string) => {
    setDownloadingId(bookingId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-receipt", {
        body: { booking_id: bookingId },
      });

      if (error) throw error;

      // data is already an ArrayBuffer or Blob from the edge function
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${bookingId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded");
    } catch (err) {
      console.error("Receipt download error:", err);
      toast.error("Could not download receipt");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  const handlePayment = async () => {
    if (!payingBooking) return;
    
    setIsPaying(true);
    try {
      if (paymentMethod === "card") {
        // Stripe payment flow
        const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
          body: {
            booking_id: payingBooking.id,
            success_url: `${window.location.origin}/payment-success`,
            cancel_url: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;
        
        // Redirect to Stripe checkout
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL received");
        }
      } else if (paymentMethod === "mpesa") {
        // M-Pesa payment flow
        const { data, error } = await supabase.functions.invoke("initiate-mpesa-payment", {
          body: {
            booking_id: payingBooking.id,
            phone_number: mpesaPhone,
            amount: payingBooking.total_amount,
          },
        });

        if (error) throw error;
        
        toast.success("STK Push sent to your phone! Please complete the payment.");
        setPayingBooking(null);
        setMpesaPhone("");
        
        // Refresh bookings after a delay
        setTimeout(() => {
          fetchBookings();
        }, 5000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (authLoading) {
    return (
      <PageTransition>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-12 px-4 shadow-sm text-foreground">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => navigate("/admin")} 
                        className="rounded-full w-12 h-12 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 p-0 shadow-sm"
                      >
                        <ShieldCheck className="w-6 h-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open Admin Dashboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button variant="outline" onClick={handleSignOut} className="rounded-xl border-border">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="bg-card/30 rounded-2xl p-6 border border-dashed border-border flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-64" />
              </div>
              <BookingSkeleton />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground">No Bookings Yet</h2>
              <p className="text-muted-foreground mt-2">Start your adventure by booking a safari package.</p>
              <Button onClick={() => navigate("/safaris")} className="mt-6 bg-accent text-accent-foreground rounded-xl">
                Browse Safaris
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-card rounded-2xl border border-border p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{booking.safari_title}</h3>
                      <Badge className={statusColors[booking.status] || "bg-muted text-muted-foreground"}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {booking.preferred_date}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {booking.guests} guest{booking.guests !== 1 ? "s" : ""}</span>
                      {booking.total_amount > 0 && (
                        <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> ${(booking.total_amount / 100).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(booking.status === "confirmed" || booking.status === "completed") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(booking.id)}
                        disabled={downloadingId === booking.id}
                        className="rounded-xl"
                      >
                        {downloadingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Download className="w-4 h-4 mr-1" />
                        )}
                        Receipt
                      </Button>
                    )}
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="default" size="sm" onClick={() => setPayingBooking(booking)} className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                          Pay Now
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingBooking(booking)} className="rounded-xl">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => cancelBooking(booking.id)} className="rounded-xl">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <EditBookingModal 
        booking={editingBooking} 
        open={!!editingBooking} 
        onOpenChange={(open) => !open && setEditingBooking(null)} 
        onSuccess={fetchBookings} 
      />

      <Dialog open={!!payingBooking} onOpenChange={(open) => !open && setPayingBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Payment Method</label>
              <Select value={paymentMethod} onValueChange={(v: "card" | "mpesa") => setPaymentMethod(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit / Debit Card (Stripe)</SelectItem>
                  <SelectItem value="mpesa">M-Pesa (Mobile Money)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {paymentMethod === "card" && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" /> You'll be securely redirected to Stripe checkout.
              </p>
            )}

            {paymentMethod === "mpesa" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">M-Pesa Phone Number</label>
                <Input type="tel" placeholder="254700000000" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} required />
                <p className="text-xs text-muted-foreground">You will receive an STK Push on your phone to complete the payment.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayingBooking(null)}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handlePayment} disabled={isPaying || (paymentMethod === "mpesa" && !mpesaPhone.trim())}>
              {isPaying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {paymentMethod === "card" ? "Proceed to Stripe" : "Send STK Push"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </PageTransition>
  );
};

export default Dashboard;
