import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const { SEND_EMAIL, PWD, RECV_EMAIL } = Deno.env.toObject();

if (!SEND_EMAIL || !PWD || !RECV_EMAIL) {
  throw new Error(
    "I need environment variables to send an email: SEND_EMAIL, PWD, & RECV_EMAIL",
  );
}

const client = new SmtpClient({ content_encoding: "7bit" });

await client.connectTLS({
  hostname: "smtp.gmail.com",
  port: 465,
  username: SEND_EMAIL,
  password: PWD,
});

export interface EmailOptions {
  subject: string;
  content: string;
  html?: string;
}

export async function base64Email({ content, subject }: EmailOptions) {
  await client.send({
    from: SEND_EMAIL, // Your EmailOptions address
    to: RECV_EMAIL, // EmailOptions address of the destination
    // subject: "Testing Deno SMTP client",
    // content: msg,
    subject,
    content,
  });
  await client.close();
}
