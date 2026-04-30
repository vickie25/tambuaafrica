import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const baseInquirySchema = {
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100, "Name is too long."),
  email: z.string().trim().email("Please enter a valid email address.").max(255, "Email is too long."),
  phone: z.string().trim().max(50, "Phone number is too long.").optional().or(z.literal("")),
  status: z.string().default("unread"),
};

export const bookingInquirySchema = z.object({
  inquiryType: z.literal("booking"),
  ...baseInquirySchema,
  safariId: z.string().trim().min(1, "Please select a safari package.").max(100),
  safariTitle: z.string().trim().min(1, "Missing safari title.").max(200),
  preferredDate: z.string().trim().min(1, "Please choose a preferred date."),
  guests: z.string().trim().min(1, "Please choose the number of guests.").max(20),
  message: z.string().trim().max(3000, "Special requests are too long.").optional().or(z.literal("")),
});

export const contactInquirySchema = z.object({
  inquiryType: z.literal("contact"),
  ...baseInquirySchema,
  subject: z.string().trim().min(2, "Please add a subject.").max(150, "Subject is too long."),
  message: z.string().trim().min(10, "Please add a little more detail.").max(3000, "Message is too long."),
});

const inquirySubmissionSchema = z.discriminatedUnion("inquiryType", [bookingInquirySchema, contactInquirySchema]);

const inquiryResponseSchema = z.object({
  success: z.boolean(),
  submissionId: z.string(),
  googleSheetsSynced: z.boolean(),
  emailSent: z.boolean().optional(),
  error: z.string().optional(),
});

export type BookingInquiryInput = z.infer<typeof bookingInquirySchema>;
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;

export const submitInquiry = async (payload: BookingInquiryInput | ContactInquiryInput) => {
  const parsedPayload = inquirySubmissionSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error(parsedPayload.error.issues[0]?.message || "Please review the form and try again.");
  }

  const { data, error } = await supabase.functions.invoke("submit-inquiry", {
    body: parsedPayload.data,
  });

  if (error) {
    throw new Error(error.message || "We could not send your request right now.");
  }

  const parsedResponse = inquiryResponseSchema.safeParse(data);

  if (!parsedResponse.success) {
    throw new Error("We received an unexpected response from the server.");
  }

  if (!parsedResponse.data.success) {
    throw new Error(parsedResponse.data.error || "We could not send your request right now.");
  }

  return parsedResponse.data;
};
