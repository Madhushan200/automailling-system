import nodemailer from "nodemailer";
import { CompanySettings } from "./types";
import { initialCompanySettings } from "./initial-data";

export interface SendEmailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
  customSettings?: Partial<CompanySettings>;
}

export function createSMTPTransporter(settings?: Partial<CompanySettings>) {
  const host = settings?.smtp_host || process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(settings?.smtp_port || process.env.SMTP_PORT || 465);
  const user = settings?.smtp_user || process.env.SMTP_USER || "reservations@dodozleisure.com";
  const pass = settings?.smtp_pass || process.env.SMTP_PASS || "";
  const secure = port === 465 || settings?.smtp_secure || process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert issues on shared hosts
    },
  });
}

export async function sendEmailWithVoucher(options: SendEmailOptions) {
  const settings = {
    ...initialCompanySettings,
    ...(options.customSettings || {}),
  };

  const transporter = createSMTPTransporter(settings);

  const sender =
    settings.sender_name && settings.sender_email
      ? `"${settings.sender_name}" <${settings.sender_email}>`
      : options.customSettings?.smtp_user || process.env.SMTP_USER || "reservations@dodozleisure.com";

  const mailOptions = {
    from: sender,
    to: options.to,
    cc: options.cc || undefined,
    bcc: options.bcc || undefined,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text?.replace(/\n/g, "<br/>"),
    attachments: options.attachments,
  };

  return await transporter.sendMail(mailOptions);
}
