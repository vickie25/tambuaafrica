import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Users, CreditCard, MapPin, Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { useSafaris } from "@/hooks/useSafaris";

interface BookingForm {
  safari_id: string;
  preferred_date: string;
  guests: number;
  notes: string;
}

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: safaris = [] } = useSafaris();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingForm>({
    safari_id: "",
    preferred_date: "",
    guests: 1,
    notes: "",
  });

  const destination = searchParams.get("destination");
  const lodge = searchParams.get("lodge");

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    // Pre-fill form based on URL parameters
    if (destination) {
      const notes = lodge 
        ? `Booking for ${destination} - ${lodge}`
        : `Booking for ${destination}`;
      setFormData(prev => ({ ...prev, notes }));
    }
  }, [user, navigate, destination, lodge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow booking without safari_id if it's a destination booking
    if (!formData.preferred_date) {
      toast.error("Please select a preferred date");
      return;
    }

    setSubmitting(true);
    
    try {
      const selectedSafari = safaris.find(s => s.id === formData.safari_id);
      const totalAmount = selectedSafari?.price ? selectedSafari.price * formData.guests * 100 : 0;

      // For destination bookings (no safari), use destination/lodge in safari_title
      const safariTitle = selectedSafari?.title || 
        (destination ? `Destination: ${destination}${lodge ? ' - ' + lodge : ''}` : "Custom Safari");

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          safari_id: formData.safari_id || null,
          safari_title: safariTitle,
          travel_date: formData.preferred_date,
          number_of_people: formData.guests,
          total_amount: totalAmount,
          currency: "USD",
          notes: formData.notes,
          user_id: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Booking created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BookingForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container-wide mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Book Your Safari Adventure
                </h1>
                <p className="text-muted-foreground">
                  {destination && lodge 
                    ? `Complete your booking for ${lodge} in ${destination}`
                    : destination 
                    ? `Complete your booking for ${destination}`
                    : "Choose your perfect safari experience"}
                </p>
              </div>

              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Safari Selection - optional for destination bookings */}
                    <div className="space-y-2">
                      <Label htmlFor="safari_id">
                        {destination ? "Select Safari Package (Optional)" : "Select Safari Package *"}
                      </Label>
                      <Select
                        value={formData.safari_id}
                        onValueChange={(value) => handleInputChange("safari_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={destination ? "Select a safari or skip for destination inquiry" : "Choose a safari package"} />
                        </SelectTrigger>
                        <SelectContent>
                          {!destination && <SelectItem value="">No specific safari - destination inquiry only</SelectItem>}
                          {safaris.map((safari) => (
                            <SelectItem key={safari.id} value={safari.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{safari.title}</span>
                                <span className="text-sm text-muted-foreground">
                                  {safari.duration} - ${safari.price}/person
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Preferred Date */}
                    <div className="space-y-2">
                      <Label htmlFor="preferred_date">Preferred Date *</Label>
                      <Input
                        id="preferred_date"
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => handleInputChange("preferred_date", e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* Number of Guests */}
                    <div className="space-y-2">
                      <Label htmlFor="guests">Number of Guests *</Label>
                      <Select
                        value={formData.guests.toString()}
                        onValueChange={(value) => handleInputChange("guests", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Any special requirements or questions..."
                        rows={4}
                      />
                    </div>

                    {/* User Info Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Booking Information</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Email: {user.email}</p>
                        {destination && (
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Destination: {destination}
                            {lodge && ` - ${lodge}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating Booking...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Create Booking
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Booking;
