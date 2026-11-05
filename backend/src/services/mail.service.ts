import nodemailer from "nodemailer";
import { config } from "../config/env.js";

const transport = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    })
  : null;

/** Sends a notification email if SMTP is configured; otherwise does nothing. Never throws. */
export async function notify(subject: string, text: string, replyTo?: string) {
  if (!transport || !config.smtp.notify) return false;
  try {
    await transport.sendMail({ from: config.smtp.from, to: config.smtp.notify, subject, text, replyTo });
    return true;
  } catch (err) {
    console.error("[mail] failed to send notification", err);
    return false;
  }
}
