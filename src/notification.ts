import { base64Email, EmailOptions } from "./email.ts";

type SubscriberUpdate = {
  method: "email";
  data: EmailOptions;
} | {
  method: "sms";
  data: string;
};

export async function notifySubscribers(update: SubscriberUpdate) {
  switch (update.method) {
    case "email": {
      await base64Email(update.data);
      break;
    }

    case "sms": {
      throw new Error(
        `'sms' is not implemented as a Subscriber Notification type yet.`,
      );
    }
  }
}
