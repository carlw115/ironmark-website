"use server";

import { Resend } from "resend";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitContact(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const business = formData.get("business") as string;
  const revenue = formData.get("revenue") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("submitContact: RESEND_API_KEY is not set");
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again shortly.",
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "Ironmark Capital <noreply@ironmark.capital>",
    to: "carl@ironmark.capital",
    replyTo: email,
    subject: `New inquiry from ${name}${business ? ` — ${business}` : ""}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      business ? `Business: ${business}` : null,
      revenue ? `Revenue: ${revenue}` : null,
      ``,
      `Message:`,
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    console.error("submitContact: Resend error:", JSON.stringify(error));
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again shortly.",
    };
  }

  return { status: "success" };
}
