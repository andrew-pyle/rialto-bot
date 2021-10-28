// import { installGlobals } from "https://deno.land/x/virtualstorage@0.1.0/mod.ts";

/** @jsx h */
import { h, jsx, serve } from "https://deno.land/x/sift@0.4.2/mod.ts";
import { Page, NotFound, botRun } from "./src/routes.tsx";

// // Polyfill localStorage for Deno Deploy
// installGlobals();

serve({
  "/": () => jsx(<Page />),
  "/bot": botRun,
  404: () => jsx(<NotFound />, { status: 404 }),
});
