// import { installGlobals } from "https://deno.land/x/virtualstorage@0.1.0/mod.ts";
import { main } from "./src/main.ts";

// // Polyfill localStorage for Deno Deploy
// installGlobals();

// Run bot
await main();
