import {
  cheerio,
  TagElement,
  TextElement,
} from "https://deno.land/x/cheerio@1.0.4/mod.ts";
import parse from "https://deno.land/x/date_fns@v2.22.1/parse/index.js";

export const RIALTO_URL = "https://searcyrialtotheater.com";

interface RialtoData {
  imdbLink: URL;
  posterLink?: URL;
  showTimes: Date[];
}

// Scrape the Rialto website
export async function fetchRialtoData(): Promise<RialtoData> {
  const res = await fetch(RIALTO_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  if (!$) {
    throw new Error(`Could not parse HTTP response from ${RIALTO_URL}`);
  }

  const imdbLink = $("td a").attr("href");
  const relativePosterLink = $("td a img").attr("src");

  if (!imdbLink || !relativePosterLink) {
    throw new Error(
      "Could not parse the Rialto website to get the 'Now Playing' Movie at the Rialto."
    );
  }

  // Show Times are a giant <h3> with <br> separators inside. WHY??
  // <h3>Thr 2021-10-28 6:30 pm<br>Fri 2021-10-29 6:30 pm</h3>
  const showTimesH3Contents = ($("td h3")[1] as TagElement).childNodes ?? [];
  const showTimesText = showTimesH3Contents
    .filter(isTextElement) // remove dumb <br> separators
    .map((element) => element.data ?? "");
  // Parses each date in the runtime's local timezone
  const showTimes = parseRialtoDateString(showTimesText);

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

function parseRialtoDateString(html: string[]): Date[] {
  const empiricalFormatString = "E yyyy-MM-dd h:mm a";
  return html.reduce<Date[]>((acc, node) => {
    try {
      // Remove whitespace, `(`, and `)`
      // Also transform weekday abbreviations
      const potentiallyATime = node //.nodeValue
        ?.trim()
        .replaceAll("Thr", "Thu")
        .replaceAll(/\(|\)/g, "");

      // Parse date string
      const date = parse(
        potentiallyATime,
        empiricalFormatString,
        new Date(), // This fallback date shouldn't be necessary, but it is required
        {}
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
  }, []);
}

function isTextElement(
  element: TagElement | TextElement
): element is TagElement {
  return element.type === "text";
}
