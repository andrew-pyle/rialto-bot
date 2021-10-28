/** @jsx h */
/** @jsxFrag Fragment */
import {
  h,
  Fragment,
  Handler,
  JSX,
} from "https://deno.land/x/sift@0.4.2/mod.ts";
import { main } from "./main.ts";

const { ALLOW_BOT_KEY } = Deno.env.toObject();
if (!ALLOW_BOT_KEY) {
  throw new Error(
    "I need environment variables to start the server: ALLOW_BOT_KEY"
  );
}

export function Page(): JSX.Element {
  return (
    <>
      <h1>Rialto Bot</h1>
      <h2>Coming Soon:</h2>
      <p>Sign up for updates when the Rialto Theater is showing a new film.</p>
      <p>Rialto Theater</p>
      <p>Searcy, AR, USA</p>
      <p>
        This is an independent project. We are not associated with the Rialto
        Theater, or the City of Searcy.
      </p>
    </>
  );
}

export function NotFound(): JSX.Element {
  return <h1>Page Not Found</h1>;
}

export const botRun: Handler = async (request: Request) => {
  const apiKey = request.headers.get("api-key");
  const allowBotKey = Deno.env.get("ALLOW_BOT_KEY");

  if (request.method !== "GET" || apiKey !== allowBotKey) {
    return new Response("Invalid Request", {
      status: 400,
      statusText: "Invalid Request",
    });
  }

  await main();
  return new Response("Bot Run Success");
};
