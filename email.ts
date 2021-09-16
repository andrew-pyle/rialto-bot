import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const { SEND_EMAIL, PWD, RECV_EMAIL } = Deno.env.toObject();
const client = new SmtpClient();

await client.connectTLS({
  hostname: "smtp.gmail.com",
  port: 465,
  username: SEND_EMAIL,
  password: PWD,
});

export async function email(msg: string) {
  await client.send({
    from: SEND_EMAIL, // Your Email address
    to: RECV_EMAIL, // Email address of the destination
    subject: "Testing Deno SMTP client",
    content: msg,
  });
  await client.close();
}
