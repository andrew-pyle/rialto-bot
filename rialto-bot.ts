import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { email } from "./email.ts";

const RIALTO_URL = "https://searcyrialtotheater.com";
const IMDB_API_URL = "https://imdb-api.com/en/API";
const FEATURE_STORAGE_KEY = "rialtoFeature";
// try {

// Load Environment Variables
const IMDB_API_KEY = Deno.env.get("IMDB_API_KEY");
if (!IMDB_API_KEY) {
  throw new Error(
    `Required env var 'IMDB_API_KEY' was not supplied. Aborting.`,
  );
}

// Scrape the Rialto website
const html = await fetch(RIALTO_URL).then((res) => res.text());
const doc = new DOMParser().parseFromString(html, "text/html");

if (!doc) {
  throw new Error(`Could not parse HTTP response from ${RIALTO_URL}`);
}

const imdbLink = doc.querySelector("td a")?.attributes.href;
const posterLink = new URL(
  doc.querySelector("td a img")?.attributes.src ?? ".",
  RIALTO_URL,
).toString();

if (!imdbLink) {
  throw new Error(
    "Could not access the IMDB id of the 'Now Playing' Movie at the Rialto.",
  );
}

// Translate web scrape into data from IMDB

const imdbId = extractLastPathElement(new URL(imdbLink).pathname);
const imdbApiResponse = await fetch(
  `${IMDB_API_URL}/Title/${IMDB_API_KEY}/${imdbId}`,
);

console.log({ imdbApiResponse }); // Debug

const movieData: unknown = await imdbApiResponse.json();

if (!isUseableImdbApiResponse(movieData)) {
  throw new Error("Response from imdb-api was not parseable");
}
const displayData = movieData?.fullTitle ?? "Unknown Movie";

if (!(typeof displayData === "string")) {
  throw new Error(
    `Movie Title from IMDB API was not a string: ${
      JSON.stringify(displayData)
    }`,
  );
}

// Has the feature changed since the last run?

const featureLastRun = localStorage.getItem(FEATURE_STORAGE_KEY);

// NoOp if no change in the movie
if (featureLastRun === imdbId) {
  console.log(
    `Rialto Feature has not changed since the last run: "${displayData}"`,
  );
}
// else {
// Update Current Movie & send subscriber update
localStorage.setItem(FEATURE_STORAGE_KEY, imdbId);
await notifySubscribers({
  posterLink,
  displayData,
  movieData,
});
// }

// } catch (err) {
//   console.error(`Failed job due to error: ${err}`);
// }

/**
 * Helper Functions
 */
function extractLastPathElement(pathname: string): string {
  const elements = pathname.split("/").filter((el) => el.length > 0);
  return elements[elements.length - 1];
}

type ImdbApi = Record<string, unknown>;
function isUseableImdbApiResponse(json: unknown): json is ImdbApi {
  if (!(typeof json === "object" && json !== null)) {
    throw new Error("Response from imdb-api was not parseable");
  }
  return "fullTitle" in json;
}

interface params {
  posterLink: string;
  displayData: string;
  movieData: ImdbApi;
}
async function notifySubscribers({
  posterLink,
  displayData,
  movieData,
}: params) {
  console.log({
    imdbLink,
    posterLink,
    message: `Movie showing now is "${displayData}"`,
  });
  const html = `${displayData} / ${posterLink}`;
  await email(html);
}
