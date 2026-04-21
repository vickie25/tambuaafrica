import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let debugMode = false;
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
    if (!user?.email) throw new Error("Not authenticated");

    const payload = await req.json();
    debugMode = Boolean(payload?.debug);

    const {
      safariId,
      safariTitle,
      priceId,
      guests,
      preferredDate,
      notes,
      existingBookingId,
    } = payload;

    const effectivePriceId =
      (typeof priceId === "string" && priceId.trim() !== "" ? priceId : null) ??
      (typeof (payload as any).stripePriceId === "string" && (payload as any).stripePriceId.trim() !== "" ? (payload as any).stripePriceId : null) ??
      (typeof (payload as any).stripe_price_id === "string" && (payload as any).stripe_price_id.trim() !== "" ? (payload as any).stripe_price_id : null);

    if (!effectivePriceId) {
      throw new Error("Missing required payment fields: set a Stripe Price ID in safaris.stripe_price_id or pass priceId in the request body");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const guestCount = Math.max(1, parseInt(guests) || 1);
    let bookingId = existingBookingId as string | undefined;

    if (bookingId) {
      const { data: existingBooking, error: existingBookingError } = await supabaseAdmin
        .from("bookings")
        .select("id, user_id, status")
        .eq("id", bookingId)
        .single();

      if (existingBookingError || !existingBooking) {
        throw new Error("Booking not found");
      }

      if (existingBooking.user_id !== user.id) {
        throw new Error("Unauthorized booking access");
      }

      if (existingBooking.status !== "pending") {
        throw new Error("Only pending bookings can be paid");
      }
    } else {
      if (!safariId || !safariTitle || !preferredDate) {
        throw new Error("Missing required booking fields");
      }

      const bookingInsertPayload = {
        user_id: user.id,
        safari_id: safariId,
        safari_title: safariTitle,
        preferred_date: preferredDate,
        guests: guestCount,
        notes: notes || null,
        status: "pending",
      };

      let { data: booking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .insert(bookingInsertPayload)
        .select("id")
        .single();

      const message = bookingError?.message?.toLowerCase() || "";
      const needsLegacyColumns =
        message.includes("number_of_people") || message.includes("travel_date");

      if (bookingError && needsLegacyColumns) {
        const fallback = await supabaseAdmin
          .from("bookings")
          .insert({
            ...bookingInsertPayload,
            travel_date: preferredDate,
            number_of_people: guestCount,
            contact_email: user.email,
            contact_phone: null,
            special_requests: notes || null,
          })
          .select("id")
          .single();
        booking = fallback.data;
        bookingError = fallback.error;
      }

      if (bookingError || !booking) throw new Error("Could not create booking");
      bookingId = booking.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: effectivePriceId, quantity: guestCount }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
      metadata: {
        booking_id: bookingId!,
        user_id: user.id,
      },
    });

    // Create payment record
    await supabaseAdmin.from("payments").insert({
      booking_id: bookingId!,
      user_id: user.id,
      stripe_session_id: session.id,
      amount: 0, // will be updated after payment
      currency: "usd",
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url, bookingId }), {
      headers: corsHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      error: message,
      ...(debugMode && error instanceof Error ? { debug: { message: error.message, stack: error.stack } } : {}),
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
