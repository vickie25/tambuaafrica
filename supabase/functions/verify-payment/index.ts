import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.2";
import { Resend } from "npm:resend@3.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Content-Type": "application/json",
};

const sendBookingConfirmationEmail = async (payload: {
  companyEmail: string;
  customerEmail: string;
  safariTitle: string;
  preferredDate: string;
  guests: number;
  amount: number;
  currency: string;
  bookingId: string;
}) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return;

  const resend = new Resend(resendApiKey);
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
  const recipients = [payload.companyEmail, payload.customerEmail].filter(Boolean);
  const amountText = `${(payload.amount / 100).toFixed(2)} ${(payload.currency || "usd").toUpperCase()}`;

  await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `Booking Confirmed: ${payload.safariTitle} (${payload.bookingId.slice(0, 8).toUpperCase()})`,
    reply_to: payload.customerEmail,
    html: `
      <h2>Booking Confirmed</h2>
      <p><strong>Booking ID:</strong> ${payload.bookingId}</p>
      <p><strong>Safari:</strong> ${payload.safariTitle}</p>
      <p><strong>Date:</strong> ${payload.preferredDate}</p>
      <p><strong>Guests:</strong> ${payload.guests}</p>
      <p><strong>Amount:</strong> ${amountText}</p>
      <p><strong>Customer:</strong> ${payload.customerEmail}</p>
    `,
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_PUBLIC_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing authorization header");
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user?.id) throw new Error("Not authenticated");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const bookingIdFromMetadata =
      typeof session.metadata?.booking_id === "string" ? session.metadata.booking_id : null;
    const userIdFromMetadata =
      typeof session.metadata?.user_id === "string" ? session.metadata.user_id : null;

    if (session.payment_status === "paid") {
      if (!bookingIdFromMetadata || !userIdFromMetadata) {
        throw new Error("Invalid payment session metadata");
      }

      if (userIdFromMetadata !== user.id) {
        throw new Error("Unauthorized payment verification");
      }

      // Update payment
      await supabase
        .from("payments")
        .update({
          status: "succeeded",
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session_id);

      // Confirm booking
      await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          total_amount: session.amount_total || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingIdFromMetadata)
        .eq("user_id", user.id);

      const { data: booking } = await supabase
        .from("bookings")
        .select("id, safari_title, preferred_date, guests, total_amount, currency")
        .eq("id", bookingIdFromMetadata)
        .single();

      const companyEmail = Deno.env.get("COMPANY_NOTIFICATION_EMAIL")
        || Deno.env.get("COMPANY_EMAIL")
        || "tambuaafrica@gmail.com";
      try {
        if (booking) {
          await sendBookingConfirmationEmail({
            companyEmail,
            customerEmail: user.email || "",
            safariTitle: booking.safari_title || "Safari Booking",
            preferredDate: booking.preferred_date || "",
            guests: Number(booking.guests || 1),
            amount: Number(booking.total_amount || session.amount_total || 0),
            currency: booking.currency || session.currency || "usd",
            bookingId: booking.id,
          });
        }
      } catch (emailError) {
        console.error("Booking confirmation email failed:", emailError);
      }

      return new Response(JSON.stringify({ status: "paid", amount: session.amount_total, currency: session.currency }), {
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ status: session.payment_status }), {
      headers: corsHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
