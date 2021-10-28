import { Handler } from "https://deno.land/x/sift@0.4.2/mod.ts";
import { main } from "./bot/main.ts";

const { ALLOW_BOT_KEY } = Deno.env.toObject();
if (!ALLOW_BOT_KEY) {
  throw new Error(
    "I need environment variables to start the server: ALLOW_BOT_KEY"
  );
}

export const botRun: Handler = async (request: Request) => {
  const apiKey = request.headers.get("api-key");

  if (request.method !== "GET" || apiKey !== ALLOW_BOT_KEY) {
    return new Response("Invalid Request", {
      status: 400,
      statusText: "Invalid Request",
    });
  }

  await main();
  return new Response("Bot Run Success");
};
