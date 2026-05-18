import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("Missing booking_id");

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) throw new Error("Booking not found");

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    // Fetch payment
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data: payment } = await adminClient
      .from("payments")
      .select("*")
      .eq("booking_id", booking_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const receiptDate = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const bookingDate = new Date(booking.preferred_date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const amount = (booking.total_amount / 100).toFixed(2);
    const currency = (booking.currency || "usd").toUpperCase();
    const customerName = profile?.full_name || user.email || "Guest";
    const customerPhone = profile?.phone || "N/A";
    const paymentStatus = payment?.status || booking.status;
    const paymentId = payment?.stripe_payment_intent_id || booking.id.slice(0, 8).toUpperCase();

    // Generate PDF using raw PDF content
    const pdfContent = generatePDF({
      receiptDate,
      bookingId: booking.id.slice(0, 8).toUpperCase(),
      customerName,
      customerEmail: user.email || "",
      customerPhone,
      safariTitle: booking.safari_title,
      bookingDate,
      guests: booking.guests,
      amount,
      currency,
      paymentStatus,
      paymentId,
    });

    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${booking.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

interface ReceiptData {
  receiptDate: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  safariTitle: string;
  bookingDate: string;
  guests: number;
  amount: string;
  currency: string;
  paymentStatus: string;
  paymentId: string;
}

function generatePDF(data: ReceiptData): Uint8Array {
  // Build PDF manually (PDF 1.4 spec)
  const lines: string[] = [];
  const objects: { offset: number }[] = [];
  let pos = 0;

  function write(s: string) {
    lines.push(s);
    pos += s.length + 1; // +1 for newline
  }

  function startObj(num: number) {
    objects[num] = { offset: pos };
    write(`${num} 0 obj`);
  }

  write("%PDF-1.4");

  // Catalog
  startObj(1);
  write("<< /Type /Catalog /Pages 2 0 R >>");
  write("endobj");

  // Pages
  startObj(2);
  write("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  write("endobj");

  // Build page content stream
  const contentLines: string[] = [];

  // Background
  contentLines.push("0.141 0.263 0.125 rg"); // Dark green
  contentLines.push("0 792 612 -120 re f");

  // Header text - white
  contentLines.push("1 1 1 rg");
  contentLines.push("BT /F1 24 Tf 50 730 Td (TAMBUA AFRICA) Tj ET");
  contentLines.push("BT /F2 11 Tf 50 710 Td (Safari Tours & Travel) Tj ET");
  contentLines.push("BT /F2 9 Tf 50 690 Td (Plainsview Road, Nairobi, Kenya | info@tambua-africa.com | isaac@tambua-africa.com | jorim@tambua-africa.com) Tj ET");

  // Receipt title
  contentLines.push("BT /F1 18 Tf 400 730 Td (RECEIPT) Tj ET");
  contentLines.push("BT /F2 10 Tf 400 710 Td (Date: " + escapePdf(data.receiptDate) + ") Tj ET");
  contentLines.push("BT /F2 10 Tf 400 694 Td (Receipt #: " + escapePdf(data.bookingId) + ") Tj ET");

  // Gold accent line
  contentLines.push("0.831 0.627 0.235 rg");
  contentLines.push("50 660 512 3 re f");

  // Customer details section
  contentLines.push("0.176 0.204 0.212 rg"); // Dark text
  contentLines.push("BT /F1 12 Tf 50 635 Td (Customer Details) Tj ET");

  contentLines.push("0.420 0.451 0.502 rg"); // Muted text
  contentLines.push("BT /F2 10 Tf 50 618 Td (Name:) Tj ET");
  contentLines.push("0.176 0.204 0.212 rg");
  contentLines.push("BT /F2 10 Tf 150 618 Td (" + escapePdf(data.customerName) + ") Tj ET");

  contentLines.push("0.420 0.451 0.502 rg");
  contentLines.push("BT /F2 10 Tf 50 602 Td (Email:) Tj ET");
  contentLines.push("0.176 0.204 0.212 rg");
  contentLines.push("BT /F2 10 Tf 150 602 Td (" + escapePdf(data.customerEmail) + ") Tj ET");

  contentLines.push("0.420 0.451 0.502 rg");
  contentLines.push("BT /F2 10 Tf 50 586 Td (Phone:) Tj ET");
  contentLines.push("0.176 0.204 0.212 rg");
  contentLines.push("BT /F2 10 Tf 150 586 Td (" + escapePdf(data.customerPhone) + ") Tj ET");

  // Separator
  contentLines.push("0.878 0.878 0.878 rg");
  contentLines.push("50 570 512 1 re f");

  // Booking details section
  contentLines.push("0.176 0.204 0.212 rg");
  contentLines.push("BT /F1 12 Tf 50 550 Td (Booking Details) Tj ET");

  // Table header
  contentLines.push("0.957 0.949 0.937 rg"); // Light bg
  contentLines.push("50 525 512 22 re f");
  contentLines.push("0.176 0.204 0.212 rg");
  contentLines.push("BT /F1 10 Tf 55 531 Td (Description) Tj ET");
  contentLines.push("BT /F1 10 Tf 320 531 Td (Date) Tj ET");
  contentLines.push("BT /F1 10 Tf 430 531 Td (Guests) Tj ET");
  contentLines.push("BT /F1 10 Tf 500 531 Td (Amount) Tj ET");

  // Table row
  contentLines.push("BT /F2 10 Tf 55 507 Td (" + escapePdf(data.safariTitle) + ") Tj ET");
  contentLines.push("BT /F2 10 Tf 320 507 Td (" + escapePdf(data.bookingDate) + ") Tj ET");
  contentLines.push("BT /F2 10 Tf 440 507 Td (" + data.guests.toString() + ") Tj ET");
  contentLines.push("BT /F1 10 Tf 500 507 Td ($" + data.amount + ") Tj ET");

  // Separator
  contentLines.push("0.878 0.878 0.878 rg");
  contentLines.push("50 493 512 1 re f");

  // Total
  contentLines.push("0.141 0.263 0.125 rg");
  contentLines.push("BT /F1 14 Tf 400 470 Td (Total: $" + data.amount + " " + data.currency + ") Tj ET");

  // Payment info
  contentLines.push("0.176 0.204 0.212 rg");
  contentLines.push("BT /F1 12 Tf 50 440 Td (Payment Information) Tj ET");

  contentLines.push("0.420 0.451 0.502 rg");
  contentLines.push("BT /F2 10 Tf 50 422 Td (Payment ID:) Tj ET");
  contentLines.push("0.176 0.204 0.212 rg");
  contentLines.push("BT /F2 10 Tf 150 422 Td (" + escapePdf(data.paymentId) + ") Tj ET");

  contentLines.push("0.420 0.451 0.502 rg");
  contentLines.push("BT /F2 10 Tf 50 406 Td (Status:) Tj ET");

  // Status color
  if (data.paymentStatus === "succeeded" || data.paymentStatus === "confirmed") {
    contentLines.push("0.0 0.6 0.2 rg");
  } else {
    contentLines.push("0.8 0.6 0.0 rg");
  }
  contentLines.push("BT /F1 10 Tf 150 406 Td (" + escapePdf(data.paymentStatus.toUpperCase()) + ") Tj ET");

  // Gold accent line bottom
  contentLines.push("0.831 0.627 0.235 rg");
  contentLines.push("50 380 512 3 re f");

  // Footer
  contentLines.push("0.420 0.451 0.502 rg");
  contentLines.push("BT /F2 9 Tf 50 355 Td (Thank you for choosing Tambua Africa for your safari adventure!) Tj ET");
  contentLines.push("BT /F2 8 Tf 50 340 Td (For questions: info@tambua-africa.com, isaac@tambua-africa.com, jorim@tambua-africa.com | +254 700 000 000) Tj ET");
  contentLines.push("BT /F2 8 Tf 50 325 Td (This is a computer-generated receipt and does not require a signature.) Tj ET");

  const contentStream = contentLines.join("\n");

  // Page
  startObj(3);
  write("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]");
  write("/Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>");
  write("endobj");

  // Content stream
  startObj(4);
  write("<< /Length " + contentStream.length + " >>");
  write("stream");
  write(contentStream);
  write("endstream");
  write("endobj");

  // Font - Helvetica Bold
  startObj(5);
  write("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  write("endobj");

  // Font - Helvetica
  startObj(6);
  write("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  write("endobj");

  // Cross-reference table
  const xrefOffset = pos;
  write("xref");
  write("0 7");
  write("0000000000 65535 f ");
  for (let i = 1; i <= 6; i++) {
    write(String(objects[i].offset).padStart(10, "0") + " 00000 n ");
  }

  write("trailer");
  write("<< /Size 7 /Root 1 0 R >>");
  write("startxref");
  write(String(xrefOffset));
  write("%%EOF");

  const pdfString = lines.join("\n");
  return new TextEncoder().encode(pdfString);
}

function escapePdf(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
