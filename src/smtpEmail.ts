import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import type { EmailData } from "./notification.ts";

const { SEND_EMAIL, PWD, RECV_EMAIL } = Deno.env.toObject();

if (!SEND_EMAIL || !PWD || !RECV_EMAIL) {
  throw new Error(
    "I need environment variables to send an email: SEND_EMAIL, PWD, & RECV_EMAIL"
  );
}

const client = new SmtpClient({ content_encoding: "7bit" });

await client.connectTLS({
  hostname: "smtp.gmail.com",
  port: 465,
  username: SEND_EMAIL,
  password: PWD,
});

export async function base64Email({
  html,
  text,
  subject,
}: EmailData["contents"]) {
  await client.send({
    from: SEND_EMAIL, // Your EmailOptions address
    to: RECV_EMAIL, // EmailOptions address of the destination
    // subject: "Testing Deno SMTP client",
    // content: msg,
    subject,
    content: html ?? text,
  });
  await client.close();
}
