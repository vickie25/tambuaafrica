const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing required Supabase environment variables.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anon = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Call edge function with user JWT and return parsed JSON + status (for clear error bodies). */
async function invokeEdgeFunction(accessToken, name, body) {
  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${name} HTTP ${res.status}: ${text.slice(0, 800)}`);
  }
  if (json && typeof json.error === "string" && json.error.length > 0) {
    throw new Error(`${name}: ${json.error}`);
  }
  return json;
}

async function getStripeSessionIdFromUrl(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const sessionId = segments.find((segment) => segment.startsWith("cs_"));
    return sessionId || null;
  } catch {
    return null;
  }
}

async function main() {
  const runId = Date.now();
  const email = `smoke.booking.${runId}@example.com`;
  const password = `TmpSmoke#${runId}`;
  let userId = null;
  const createdBookingIds = [];
  const report = [];

  const log = (label, pass, details = "", level) => {
    const icon = level || (pass ? "PASS" : "FAIL");
    const line = `[${icon}] ${label}${details ? ` :: ${details}` : ""}`;
    report.push(line);
    console.log(line);
  };

  try {
    // 1) Create smoke-test user
    const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Smoke Test User" },
    });
    if (createUserError || !createdUser?.user?.id) {
      throw new Error(`Could not create test user: ${createUserError?.message || "unknown error"}`);
    }
    userId = createdUser.user.id;
    log("Create smoke test user", true, userId);

    // 2) Sign in as that user
    const { data: signedIn, error: signInError } = await anon.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !signedIn?.session?.access_token) {
      throw new Error(`Could not sign in test user: ${signInError?.message || "missing token"}`);
    }
    const accessToken = signedIn.session.access_token;
    log("Authenticate smoke test user", true);

    // 3) Find a safari usable for card checkout
    const { data: safari, error: safariError } = await admin
      .from("safaris")
      .select("id,title,price,stripe_price_id")
      .limit(1)
      .maybeSingle();

    if (safariError || !safari) {
      throw new Error(`No safari found: ${safariError?.message || "missing data"}`);
    }
    const envSmokePrice = process.env.SMOKE_STRIPE_PRICE_ID || process.env.VITE_SMOKE_STRIPE_PRICE_ID;
    const resolvedStripePrice =
      safari.stripe_price_id && String(safari.stripe_price_id).trim() !== "" ? safari.stripe_price_id : envSmokePrice;
    if (resolvedStripePrice) {
      log("Stripe price for checkout", true, `using ${envSmokePrice && resolvedStripePrice === envSmokePrice ? "SMOKE_STRIPE_PRICE_ID" : "safari.stripe_price_id"}`);
    } else {
      log("Stripe price for checkout", false, "set safaris.stripe_price_id in Supabase or add SMOKE_STRIPE_PRICE_ID to .env for this test", "WARN");
    }
    log("Found safari for booking", true, safari.title);

    // 4) Create pending booking (dashboard/public user baseline)
    const preferredDate = "2026-12-31";
    const guests = 2;
    const bookingBasePayload = {
      safari_id: safari.id,
      safari_title: safari.title,
      preferred_date: preferredDate,
      guests,
      total_amount: safari.price * guests * 100,
      currency: "USD",
      notes: "Smoke test booking",
      user_id: userId,
      status: "pending",
    };

    let { data: createdBooking, error: bookingError } = await anon
      .from("bookings")
      .insert(bookingBasePayload)
      .select("id,status,user_id,preferred_date,guests")
      .single();

    const bookingErrorMessage = bookingError?.message?.toLowerCase() || "";
    if (bookingError && (bookingErrorMessage.includes("number_of_people") || bookingErrorMessage.includes("travel_date"))) {
      const fallback = await anon
        .from("bookings")
        .insert({
          ...bookingBasePayload,
          travel_date: preferredDate,
          number_of_people: guests,
          contact_email: email,
          contact_phone: null,
          special_requests: "Smoke test booking",
        })
        .select("id,status,user_id,preferred_date,guests")
        .single();

      createdBooking = fallback.data;
      bookingError = fallback.error;
    }

    if (bookingError || !createdBooking?.id) {
      throw new Error(`Create pending booking failed: ${bookingError?.message || "unknown error"}`);
    }
    createdBookingIds.push(createdBooking.id);
    log("Create pending booking", createdBooking.status === "pending", createdBooking.id);

    // 5) Confirm user view (dashboard) can see own booking
    const { data: ownBookings, error: ownBookingsError } = await anon
      .from("bookings")
      .select("id,status")
      .eq("user_id", userId)
      .eq("id", createdBooking.id);
    if (ownBookingsError) {
      throw new Error(`User booking read failed: ${ownBookingsError.message}`);
    }
    log("User view sees pending booking", ownBookings?.length === 1);

    // 6) Confirm public (anon without session) cannot read sensitive booking data
    const publicClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: publicBookings, error: publicReadError } = await publicClient
      .from("bookings")
      .select("id")
      .limit(1);
    const publicReadBlocked = !!publicReadError || (publicBookings || []).length === 0;
    log("Public view does not expose bookings", publicReadBlocked, publicReadError?.message || "");

    // 7) Confirm admin view can see booking
    const { data: adminBooking, error: adminBookingError } = await admin
      .from("bookings")
      .select("id,status,user_id")
      .eq("id", createdBooking.id)
      .single();
    if (adminBookingError) {
      throw new Error(`Admin booking read failed: ${adminBookingError.message}`);
    }
    log("Admin view sees pending booking", adminBooking?.status === "pending");

    // 8) Card payment flow from dashboard (initiate checkout)
    let hasCheckoutUrl = false;
    let cardResult = null;
    if (resolvedStripePrice) {
      try {
        cardResult = await invokeEdgeFunction(accessToken, "create-checkout", {
          debug: true,
          existingBookingId: createdBooking.id,
          safariId: safari.id,
          safariTitle: safari.title,
          priceId: resolvedStripePrice,
          guests: String(guests),
          preferredDate,
          notes: "Smoke test card payment",
        });
        hasCheckoutUrl = typeof cardResult?.url === "string" && cardResult.url.length > 0;
        log("Dashboard card payment initiation", hasCheckoutUrl, hasCheckoutUrl ? "checkout session url returned" : "no url in response");
      } catch (cardError) {
        log("Dashboard card payment initiation", false, cardError.message);
      }
    } else {
      log("Dashboard card payment initiation", true, "SKIP: need safaris.stripe_price_id or SMOKE_STRIPE_PRICE_ID", "WARN");
    }

    // 9) Verify payment endpoint call before actual Stripe completion
    let verifyStatus = "not-run";
    if (hasCheckoutUrl && cardResult) {
      const sessionId = await getStripeSessionIdFromUrl(cardResult.url);
      if (sessionId) {
        const verifyResult = await invokeEdgeFunction(accessToken, "verify-payment", {
          session_id: sessionId,
        });
        verifyStatus = verifyResult.status || "unknown";
        log(
          "Verify-payment endpoint reachable",
          typeof verifyStatus === "string" && verifyStatus.length > 0,
          `status=${verifyStatus}`
        );
      } else {
        log("Extract Stripe session from checkout URL", false);
      }
    }

    // 10) Confirm booking remains pending until external payment is completed
    const { data: afterCardBooking, error: afterCardError } = await admin
      .from("bookings")
      .select("id,status")
      .eq("id", createdBooking.id)
      .single();
    if (afterCardError) {
      throw new Error(`Read booking after card flow failed: ${afterCardError.message}`);
    }
    log("Booking remains pending before actual Stripe payment", afterCardBooking.status === "pending");

    // 11) M-Pesa initiation flow from dashboard
    let mpesaBookingId = null;
    try {
      const mpesaResult = await invokeEdgeFunction(accessToken, "mpesa-stk-push", {
        debug: true,
        existingBookingId: createdBooking.id,
        phone: "254700000000",
        amount: Math.max(1, safari.price * guests * 130),
        safariId: safari.id,
        safariTitle: safari.title,
        guests: String(guests),
        preferredDate,
        notes: "Smoke test mpesa payment",
      });
      mpesaBookingId = mpesaResult.bookingId || null;
      log("Dashboard M-Pesa initiation", !!mpesaBookingId, `bookingId=${mpesaBookingId || "none"}`);
    } catch (mpesaError) {
      const msg = mpesaError.message || "";
      if (msg.includes("Missing M-Pesa credentials") || msg.includes("MPESA_")) {
        log("Dashboard M-Pesa initiation", true, "SKIP: set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE in Supabase secrets (Dashboard > Edge Functions > secrets)");
      } else {
        log("Dashboard M-Pesa initiation", false, msg);
      }
    }

    // 12) Confirm booking still visible in admin and user views after payment attempts
    const { data: finalBooking, error: finalBookingError } = await admin
      .from("bookings")
      .select("id,status,updated_at")
      .eq("id", createdBooking.id)
      .single();
    if (finalBookingError) {
      throw new Error(`Final booking check failed: ${finalBookingError.message}`);
    }
    log("Final booking visible in admin", !!finalBooking?.id, `status=${finalBooking.status}`);

    const { data: userFinalView, error: userFinalError } = await anon
      .from("bookings")
      .select("id,status")
      .eq("id", createdBooking.id)
      .eq("user_id", userId);
    if (userFinalError) {
      throw new Error(`Final user view check failed: ${userFinalError.message}`);
    }
    log("Final booking visible in user dashboard view", (userFinalView || []).length === 1);

    console.log("\nSmoke test complete.");
  } catch (error) {
    console.error(`\nSmoke test aborted: ${error.message}`);
    process.exitCode = 1;
  } finally {
    // Cleanup bookings
    if (createdBookingIds.length > 0) {
      await admin.from("bookings").delete().in("id", createdBookingIds);
    }
    // Cleanup user
    if (userId) {
      await admin.auth.admin.deleteUser(userId);
    }
  }

  if (report.length > 0) {
    console.log("\nSummary:");
    report.forEach((line) => console.log(line));
  }
}

main();
