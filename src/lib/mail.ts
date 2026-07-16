import nodemailer from "nodemailer";
import { env } from "@/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth:
    env.SMTP_USER && env.SMTP_PASSWORD
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined,
});

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    ...options,
  });
}
