import {
  DOMParser,
  Node,
} from "https://deno.land/x/deno_dom@v0.1.14-alpha/deno-dom-wasm.ts";
import parse from "https://deno.land/x/date_fns@v2.22.1/parse/index.js";

export const RIALTO_URL = new URL("https://searcyrialtotheater.com");

interface RialtoData {
  imdbLink: URL;
  posterLink?: URL;
  showTimes: Date[];
}

// Scrape the Rialto website
export async function fetchRialtoData(): Promise<RialtoData> {
  const res = await fetch(RIALTO_URL);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) {
    throw new Error(`Could not parse HTTP response from ${RIALTO_URL}`);
  }

  const imdbLink = doc.querySelector("td a")?.attributes.href;
  const relativePosterLink = doc.querySelector("td a img")?.attributes.src;

  if (!imdbLink || !relativePosterLink) {
    throw new Error(
      "Could not parse the Rialto website to get the 'Now Playing' Movie at the Rialto.",
    );
  }

  // Parses each date in the runtime's local timezone
  const showTimesHtml = doc.querySelectorAll("td h3")[1].childNodes;
  const showTimes = parseRialtoDateString([...showTimesHtml]);

  //   console.log({ showTimes }); // Debug

  const posterLink = new URL(relativePosterLink, RIALTO_URL);

  //   console.log({ imdbLink, posterLink: posterLink.toString() }); // debug

  return {
    imdbLink: new URL(imdbLink),
    posterLink,
    showTimes,
  };
}

// fetchRialtoData(); // Debug

function parseRialtoDateString(html: Node[]): Date[] {
  const empiricalFormatString = "E yyyy-MM-dd h:mm a";
  return html.reduce<
    Date[]
  >(
    (acc, node) => {
      try {
        // Remove whitespace, `(`, and `)`
        // Also transform weekday abbreviations
        const potentiallyATime = node.nodeValue?.trim().replaceAll("Thr", "Thu")
          .replaceAll(/\(|\)/g, "");

        // Parse date string
        const date = parse(
          potentiallyATime,
          empiricalFormatString,
          new Date(), // This fallback date shouldn't be necessary, but it is required
          {},
        );
        // Skip Invalid Dates
        if (isNaN(date.getTime())) {
          return acc;
        }
        // Return Valid Dates
        return [...acc, date];
      } catch {
        // Skip Errors too
        return acc;
      }
    },
    [],
  );
}
