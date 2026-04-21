import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let debugMode = false;
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const payload = await req.json();
    debugMode = Boolean(payload?.debug);
    const { phone, amount, safariId, safariTitle, guests, preferredDate, notes, existingBookingId } = payload;

    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const shortcode = Deno.env.get("MPESA_SHORTCODE");
    const env = Deno.env.get("MPESA_ENVIRONMENT") || "sandbox"; // 'sandbox' or 'production'
    const projectRef = Deno.env.get("SUPABASE_PROJECT_REF") || "your-project-ref";

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      throw new Error("Missing M-Pesa credentials in environment variables.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let bookingId = existingBookingId;

    if (!bookingId) {
      // Create new booking if we're not paying for an existing one
      if (!safariId || !safariTitle || !preferredDate) {
        throw new Error("Missing required booking fields");
      }
      
      const guestCount = parseInt(guests) || 1;
      const bookingInsertPayload = {
        user_id: user.id,
        safari_id: safariId,
        safari_title: safariTitle,
        preferred_date: preferredDate,
        guests: guestCount,
        notes: notes || null,
        status: "pending",
        currency: "KES",
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
            contact_email: user.email || "",
            contact_phone: phone || null,
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

    // M-Pesa STK Push logic
    const baseUrl = env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

    // 1. Generate Auth Token
    const credentials = btoa(`${consumerKey}:${consumerSecret}`);
    const authRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` },
    });
    
    if (!authRes.ok) throw new Error("Failed to authenticate with Daraja API");
    const { access_token } = await authRes.json();

    // 2. Generate Password & Timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14); // YYYYMMDDHHmmss
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Clean phone number (format expected: 2547XXXXXXXX)
    let cleanedPhone = phone.replace(/[^0-9]/g, "");
    if (cleanedPhone.startsWith("0")) cleanedPhone = `254${cleanedPhone.slice(1)}`;
    if (cleanedPhone.startsWith("+")) cleanedPhone = cleanedPhone.slice(1);
    if (!cleanedPhone.startsWith("254") || cleanedPhone.length !== 12) {
      throw new Error("Invalid phone number format. Must start with 254 or 07/01 and have 12 digits total.");
    }

    const callbackUrl = `https://${projectRef}.supabase.co/functions/v1/mpesa-callback`;

    // 3. Send STK Push
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline", // Change to CustomerPayBillOnline if Paybill
      Amount: Math.ceil(amount), 
      PartyA: cleanedPhone,
      PartyB: shortcode,
      PhoneNumber: cleanedPhone,
      CallBackURL: callbackUrl,
      AccountReference: bookingId.slice(0, 12), // Daraja allows max 12 chars
      TransactionDesc: "Tambua Safari Booking Payment",
    };

    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = await stkRes.json();

    if (stkData.errorMessage) {
      throw new Error(stkData.errorMessage);
    }

    // 4. Save CheckoutRequestID to Database to map the callback later
    await supabaseAdmin
      .from('bookings')
      .update({ stripe_payment_intent_id: stkData.CheckoutRequestID }) // Reuse field for CheckoutRequestID
      .eq('id', bookingId);

    return new Response(JSON.stringify({ success: true, bookingId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: (error as Error).message,
      ...(debugMode ? { debug: { message: (error as Error).message, stack: (error as Error).stack } } : {}),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
