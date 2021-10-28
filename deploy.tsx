// import { installGlobals } from "https://deno.land/x/virtualstorage@0.1.0/mod.ts";

/** @jsx h */
import { serve, serveStatic } from "https://deno.land/x/sift@0.4.2/mod.ts";
import { botRun } from "./src/routes.tsx";

// // Polyfill localStorage for Deno Deploy
// installGlobals();

serve({
  // Dynamic
  "/bot": botRun,
  // Static
  "/": serveStatic("public/index.html", { baseUrl: import.meta.url }),
  404: serveStatic("public/404.html", { baseUrl: import.meta.url }),
  "/style.css": serveStatic("public/style.css", { baseUrl: import.meta.url }),
});
