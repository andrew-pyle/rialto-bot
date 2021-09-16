import { fetchRialtoData, RIALTO_URL } from "./scrapeRialtoWebsite.ts";
import { fetchImdbData } from "./imdbApi.ts";
import { notifySubscribers } from "./notification.ts";
import type { EmailOptions } from "./email.ts";

const FEATURE_STORAGE_KEY = "rialtoFeature";

try {
  // Scrape the Rialto website
  const { imdbLink, showTimes } = await fetchRialtoData();

  // Translate web scrape into data from IMDB
  const imdbId = extractLastPathElement(imdbLink.pathname);
  const movieName = await fetchImdbData(imdbId);

  // console.log({ imdbId, movieName }); // Debug

  // Has the feature changed since the last run?
  const featureLastRun = localStorage.getItem(FEATURE_STORAGE_KEY);

  // NoOp if no change in the movie
  if (featureLastRun === imdbId) {
    console.log(
      `[${
        new Date().toISOString()
      }] Rialto Feature has not changed since the last run: "${movieName}". IMDB id=${imdbId}`,
    );
  } else {
    console.log(
      `[${
        new Date().toISOString()
      }] New Rialto Feature: "${movieName}". IMDB id=${imdbId}`,
    );
    // Update Current Movie & send subscriber update
    localStorage.setItem(FEATURE_STORAGE_KEY, imdbId);

    // Convert dates into strings. TODO Create a better representation.
    const showingsString = generateShowTimesText(showTimes);

    const { subject, content } = generateEmailUpdateBody(
      movieName,
      showingsString,
      RIALTO_URL,
    );

    // Send Notification
    await notifySubscribers({
      method: "email",
      data: { subject, content },
    });
  }
} catch (err) {
  console.error(`Failed job due to error: ${err}`);
}

/**
 * Helper Functions
 */

function extractLastPathElement(pathname: string): string {
  const elements = pathname.split("/").filter((el) => el.length > 0);
  return elements[elements.length - 1];
}

function generateEmailUpdateBody(
  movieName: string,
  showTimes: string,
  link: URL,
): EmailOptions {
  return {
    subject: `"${movieName}" at the Rialto`,
    content:
      `<h1><a href="${link}">"${movieName}"</a> is now showing at the Rialto</h1><br>` +
      `<br>` +
      `${showTimes}<br>` +
      `<br>` +
      `<small>Powered by <a href="https://deno.land">Deno</a></small>`,
  };
}

function generateShowTimesText(showTimes: Date[]): string {
  return showTimes.map((date) => date.toDateString()).join(`<br/>`);
}
