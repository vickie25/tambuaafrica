import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Users, MapPin, Send, Loader2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSafaris } from "@/hooks/useSafaris";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { submitInquiry } from "@/lib/inquiry";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedSafari?: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  safari: "",
  guests: "2",
  notes: "",
};

const BookingModal = ({ open, onOpenChange, preselectedSafari }: BookingModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa">("card");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const { data: safaris = [] } = useSafaris();
  const [form, setForm] = useState({
    ...emptyForm,
    safari: preselectedSafari || "",
  });

  useEffect(() => {
    if (preselectedSafari) {
      setForm((current) => ({ ...current, safari: preselectedSafari }));
    }
  }, [preselectedSafari]);

  useEffect(() => {
    if (!open) {
      setForm({ ...emptyForm, safari: preselectedSafari || "" });
      setDate(undefined);
      setPaymentMethod("card");
      setMpesaPhone("");
      setIsSubmitting(false);
      return;
    }

    if (!date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setDate(tomorrow);
    }
  }, [open, preselectedSafari, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const selectedSafari = safaris.find((safari) => safari.id === form.safari);
    if (!selectedSafari) { toast.error("Please select a safari package."); return; }
    if (!date) { toast.error("Please choose your preferred travel date."); return; }

    const openWhatsAppBooking = () => {
      const whatsappText = `Hello Tambua Next Wave! I would like to book a safari.\n\nSafari: ${selectedSafari.title}\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nDate: ${format(date, "yyyy-MM-dd")}\nGuests: ${form.guests}\n\nNotes: ${form.notes || "None"}`;
      const whatsappUrl = buildWhatsAppUrl(whatsappText);
      window.open(whatsappUrl, '_blank');
      onOpenChange(false);
      setForm(emptyForm);
      setDate(undefined);
    };

    setIsSubmitting(true);

    try {
      // If user is logged in, create a booking and route to chosen payment gateway
      if (user) {
        if (paymentMethod === "card") {
          if (!selectedSafari.stripePriceId) {
            throw new Error("This safari package is currently unavailable for card payment. Please choose M-Pesa or contact us directly.");
          }

          const checkoutPromise = supabase.functions.invoke("create-checkout", {
            body: {
              safariId: selectedSafari.id,
              safariTitle: selectedSafari.title,
              priceId: selectedSafari.stripePriceId,
              guests: form.guests,
              preferredDate: format(date, "yyyy-MM-dd"),
              notes: form.notes,
            },
          });

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Payment processing timed out. Please try again.")), 15000)
          );

          const { data, error } = await Promise.race([checkoutPromise, timeoutPromise]) as any;

          if (error || data?.error) {
            toast.error("Card payment is currently unavailable. Please follow up via WhatsApp.");
            openWhatsAppBooking();
            return;
          }

          if (!data?.url) {
            toast.error("Unable to start checkout. Please continue via WhatsApp.");
            openWhatsAppBooking();
            return;
          }

          window.location.href = data.url;
          return;
        }

        if (paymentMethod === "mpesa") {
          if (!mpesaPhone.trim()) throw new Error("Please enter your M-Pesa phone number in the correct format (e.g. 2547XXXXXXXX)");

          try {
            const mpesaAmount = selectedSafari.price * parseInt(form.guests) * 130;
            
            const mpesaPromise = supabase.functions.invoke("mpesa-stk-push", {
              body: {
                phone: mpesaPhone,
                amount: mpesaAmount,
                safariId: selectedSafari.id,
                safariTitle: selectedSafari.title,
                guests: form.guests,
                preferredDate: format(date, "yyyy-MM-dd"),
                notes: form.notes,
              },
            });

            const mpesaTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error("M-Pesa processing timed out. Please try again.")), 15000)
            );

            const { data, error } = await Promise.race([mpesaPromise, mpesaTimeoutPromise]) as any;

            if (error || data?.error) {
              toast.error("M-Pesa is currently unavailable. Please continue via WhatsApp.");
              openWhatsAppBooking();
              return;
            }

            toast.success("M-Pesa validation sent! Check your phone to complete payment.");
          } catch (mpesaError) {
            toast.error(mpesaError instanceof Error ? mpesaError.message : "M-Pesa payment failed. Please try again or contact support.");
            openWhatsAppBooking();
            return;
          }
        }

        // Also sync to Google Sheets
        try {
          await submitInquiry({
            inquiryType: "booking",
            fullName: form.name || user.user_metadata?.full_name || "",
            email: user.email || "",
            phone: form.phone,
            safariId: selectedSafari.id,
            safariTitle: selectedSafari.title,
            preferredDate: format(date, "yyyy-MM-dd"),
            guests: form.guests,
            message: form.notes,
          });
        } catch {
          // Non-critical: sheet sync can fail silently
        }

        if (paymentMethod === "mpesa") {
          return;
        }
      } else {
        // Guest: just submit inquiry (no payment)
        const inquiryPromise = submitInquiry({
          inquiryType: "booking",
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          safariId: selectedSafari.id,
          safariTitle: selectedSafari.title,
          preferredDate: format(date, "yyyy-MM-dd"),
          guests: form.guests,
          message: form.notes,
        });

        const inquiryTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Inquiry submission timed out. Please try again or contact us directly.")), 10000)
        );

        try {
          const result = await Promise.race([inquiryPromise, inquiryTimeoutPromise]) as any;
          toast.success(
            result?.googleSheetsSynced
              ? "Booking inquiry sent! Opening WhatsApp to connect directly."
              : "Opening WhatsApp to connect directly for your booking."
          );
        } catch (inquiryError) {
          console.warn("Inquiry submission failed, proceeding to WhatsApp:", inquiryError);
          toast.success("Opening WhatsApp to connect directly for your booking.");
        }

        openWhatsAppBooking();
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process your booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Book Your Safari</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {user
              ? "Select your safari and proceed to secure checkout."
              : "Share your travel details and we'll confirm availability within 24 hours. Sign in for instant booking with secure payment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email *</label>
                <Input type="email" placeholder="john@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
          )}

          {!user && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input placeholder="+254 700 000 000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent" /> Safari Package *
            </label>
            <Select value={form.safari} onValueChange={(v) => setForm({ ...form, safari: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a safari package" />
              </SelectTrigger>
              <SelectContent>
                {safaris.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title},  ${s.price}/person
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-accent" /> Preferred Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent" /> Guests *
              </label>
              <Select value={form.guests} onValueChange={(v) => setForm({ ...form, guests: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                  <SelectItem value="10+">10+ Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Special Requests</label>
            <Textarea placeholder="Any special requirements..." rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {user && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Payment Method</label>
                <Select value={paymentMethod} onValueChange={(v: "card" | "mpesa") => setPaymentMethod(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit / Debit Card (Stripe)</SelectItem>
                    <SelectItem value="mpesa">M-Pesa (Mobile Money)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "card" && (
                <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4 text-accent" />
                  You'll be redirected to secure Stripe checkout after submitting.
                </div>
              )}
              
              {paymentMethod === "mpesa" && (
                <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border">
                  <label className="text-sm font-medium text-foreground">M-Pesa Phone Number</label>
                  <Input 
                    type="tel" 
                    placeholder="254700000000" 
                    value={mpesaPhone} 
                    onChange={(e) => setMpesaPhone(e.target.value)} 
                    required 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your Safaricom number. You will receive an STK prompt on your phone.
                  </p>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground text-center">
              <button type="button" onClick={() => { onOpenChange(false); navigate("/login"); }} className="text-accent font-medium hover:underline">
                Sign in
              </button>
              {" "}for instant booking with secure payment.
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            onPointerDown={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-5 text-base font-semibold disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : user ? <CreditCard className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
            {user ? "Proceed to Payment" : "Submit Booking Inquiry"}
          </Button>

          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              No payment required now. We'll confirm availability and send you a quote.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
