import { mailjetSend } from "./mailjetClient.ts";
import { getSubscribers } from "./dataConnector.ts";

const { SEND_EMAIL } = Deno.env.toObject();
if (!SEND_EMAIL) {
  throw new Error(
    "I need environment variables to send an email: SEND_EMAIL & RECV_EMAIL"
  );
}

interface SubscriberUpdate {
  method: "email" | "sms";
  update: {
    movieName: string; // English name
    showTimes: Date[];
    link: URL;
  };
}

export interface EmailData {
  sender: Sender;
  recepients: Subscriber[];
  contents: EmailContents;
}

interface EmailContents {
  subject: string;
  text: string;
  html?: string;
}

export interface Subscriber {
  email: string;
  name?: string;
  textOnly?: boolean;
}

interface Sender {
  email: string;
  name: string;
}

export async function notifySubscribers({ method, update }: SubscriberUpdate) {
  switch (method) {
    case "email": {
      const { movieName, showTimes, link } = update;
      const subscribers = await getSubscribers();

      if (!subscribers) {
        console.error(
          `Error sending email notifications: Subscribers list was empty.`
        );
        return;
      }

      const emailData: EmailData = {
        sender: {
          email: SEND_EMAIL,
          name: "Rialto Bot",
        },
        recepients: subscribers.map(({ email, textOnly }) => ({
          email,
          textOnly,
        })),
        contents: generateEmailUpdateBody(movieName, showTimes, link),
      };
      await mailjetSend(emailData);
      return;
    }

    case "sms": {
      throw new Error(
        `'sms' is not implemented as a Subscriber Notification type yet.`
      );
    }
  }
}

// Helpers

/**
 * Todo: use JSX and render to HTML string
 * @link https://deno.com/deploy/docs/using-jsx/
 */
function generateEmailUpdateBody(
  movieName: string,
  showTimes: Date[],
  link: URL
): EmailContents {
  const showTimesText = generateShowTimesText(showTimes);
  const showTimesHtml = generateShowTimesHtml(showTimes);

  return {
    subject: `"${movieName}" at the Rialto`,
    text: `"${movieName}" is now showing at the Rialto.\n\n${showTimesText}\n\n---------------------------------\nPowered by Deno.`,
    html:
      `<h1><a href="${link.toString()}">"${movieName}"</a> is now showing at the Rialto</h1><br>` +
      `<br>` +
      `${showTimesHtml}<br>` +
      `<br>` +
      `<small>Powered by <a href="https://deno.land">Deno</a></small>`,
  };
}

function generateShowTimesText(showTimes: Date[]): string {
  return showTimes.map((date) => date.toDateString()).join(`\n`);
}
function generateShowTimesHtml(showTimes: Date[]): string {
  return showTimes.map((date) => date.toDateString()).join(`<br>`);
}
