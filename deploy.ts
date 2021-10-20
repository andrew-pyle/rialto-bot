import { main } from "./src/main.ts";
const ONE_MINUTE = 1000 * 60; // * 60;
setInterval(() => {
  main();
}, ONE_MINUTE);
