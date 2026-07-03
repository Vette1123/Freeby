import { Resend } from "resend";
import { render } from "@react-email/components";
import { env } from "@/env";
import { VerifyEmail } from "./templates/verify-email";
import { ResetPassword } from "./templates/reset-password";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function deliver(opts: { to: string; subject: string; html: string; devLabel: string; url: string }) {
  if (!resend) {
    console.log(`\n[email:${opts.devLabel}] to=${opts.to}\n${opts.url}\n`);
    return;
  }
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) {
    // Resend returns errors in the result rather than throwing — surface them.
    console.error(`[email:error] ${opts.devLabel} to=${opts.to}:`, error);
    throw new Error(`Failed to send ${opts.devLabel} email: ${error.message ?? "unknown error"}`);
  }
  console.log(`[email:sent] ${opts.devLabel} to=${opts.to} id=${data?.id}`);
}

export async function sendVerificationEmail({ to, url }: { to: string; url: string }) {
  const html = await render(VerifyEmail({ url }));
  await deliver({ to, subject: "Verify your email", html, devLabel: "verify", url });
}

export async function sendResetPasswordEmail({ to, url }: { to: string; url: string }) {
  const html = await render(ResetPassword({ url }));
  await deliver({ to, subject: "Reset your password", html, devLabel: "reset", url });
}

/** Send an invoice email with a PDF attachment. Bypasses the dev fallback. */
export async function sendInvoiceWithAttachment(opts: {
  to: string;
  subject: string;
  html: string;
  attachment: { filename: string; content: Buffer };
}) {
  if (!resend) {
    // In dev without Resend, just log — we can't attach a PDF to the console.
    console.log(`\n[email:invoice] to=${opts.to} subject="${opts.subject}" (attachment skipped in dev)\n`);
    return;
  }
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    attachments: [
      {
        filename: opts.attachment.filename,
        content: opts.attachment.content,
      },
    ],
  });
  if (error) {
    console.error(`[email:error] invoice to=${opts.to}:`, error);
    throw new Error(`Failed to send invoice email: ${error.message ?? "unknown error"}`);
  }
  console.log(`[email:sent] invoice to=${opts.to} id=${data?.id}`);
}
