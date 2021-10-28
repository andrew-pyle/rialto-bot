// import { installGlobals } from "https://deno.land/x/virtualstorage@0.1.0/mod.ts";
/** @jsx h */
import { main } from "./src/main.ts";
import { listenAndServe } from "https://deno.land/std/http/server.ts";
import {
  h,
  renderSSR,
  Helmet,
} from "https://deno.land/x/nano_jsx@v0.0.20/mod.ts";

// // Polyfill localStorage for Deno Deploy
// installGlobals();

console.log("Listening for HTTP Requests");
await listenAndServe(":8080", (_req) => {
  // Run bot
  main().then(() => console.log("Bot run complete."));
  const html = renderSSR(<Page />);
  return new Response(html, {
    headers: { "content-type": "text/plain" },
  });
});

function Page() {
  return (
    <div>
      <Helmet>
        <title>Rialto Bot</title>
      </Helmet>
      <h1>Rialto Bot</h1>
      <h2>Coming Soon:</h2>
      <p>Sign up for updates when the Rialto Theater is showing a new film.</p>
      <p>Rialto Theater</p>
      <p>Searcy, AR, USA</p>
      <p>
        This is an independent project. We are not associated with the Rialto
        Theater, or the City of Searcy.
      </p>
    </div>
  );
}
