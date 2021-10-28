import type { EmailData } from "./notification.ts";

const { MAILJET_API_KEY, MAILJET_SECRET_KEY } = Deno.env.toObject();
if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
  throw new Error(
    "I need environment variables to send an email: MAILJET_API_KEY & MAILJET_SECRET_KEY"
  );
}

export async function mailjetSend({ sender, recepients, contents }: EmailData) {
  const { subject, html, text } = contents;
  const body = JSON.stringify({
    Messages: recepients.map((subscriber) => ({
      From: {
        Email: sender.email,
        Name: sender.name,
      },
      To: [
        {
          Email: subscriber.email,
          Name: subscriber.name,
        },
      ],
      Subject: subject,
      TextPart: subscriber.textOnly ? text : undefined,
      HTMLPart: subscriber.textOnly ? undefined : html,
      // CustomID: "AppGettingStartedTest",
    })),
  });
  // console.log(body); // Debug

  const base64Credentials = btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`);
  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: new Headers({
      Authorization: `Basic ${base64Credentials}`,
      "Content-Type": "application/json",
    }),
    body,
  });

  if (!res.ok) {
    console.error(`Error sending Mailjet email request: ${res.statusText}`);
  }

  return res.json();
}
