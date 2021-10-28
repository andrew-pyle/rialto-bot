import { fetchRialtoData, RIALTO_URL } from "./scrapeRialtoWebsite.ts";
import { fetchImdbData } from "./imdbApi.ts";
import { notifySubscribers } from "./notification.ts";
import { getFeature, setFeature } from "./dataConnector.ts";

export interface Feature {
  imdbId: string;
}

export async function main(): Promise<void> {
  try {
    // Scrape the Rialto website
    const { imdbLink, showTimes } = await fetchRialtoData();

    // Translate web scrape into data from IMDB
    const imdbId = extractLastPathElement(imdbLink.pathname);
    const movieName = await fetchImdbData(imdbId);

    // console.log({ imdbId, movieName }); // Debug

    // Has the feature changed since the last run?
    const featureLastRun = (await getFeature())?.imdbId;

    // console.log({ featureLastRun, imdbId }); // Debug

    // NoOp if no change in the movie
    if (featureLastRun === imdbId) {
      console.log(
        `[${new Date().toISOString()}] Rialto Feature has not changed since the last run: "${movieName}". IMDB id=${imdbId}`
      );
      if (Deno.env.get("IS_DEV")) {
        // Send Notification
        await notifySubscribers({
          method: "email",
          update: { movieName, showTimes, link: RIALTO_URL },
        });
      }
      return;
    }

    // There is a new feature. Update Current Movie & send subscriber update
    console.log(
      `[${new Date().toISOString()}] New Rialto Feature: "${movieName}". IMDB id=${imdbId}`
    );
    await setFeature({ imdbId });

    // Send Notification
    await notifySubscribers({
      method: "email",
      update: { movieName, showTimes, link: RIALTO_URL },
    });
  } catch (err) {
    console.error(`Failed job due to error: ${err}`);
  }
}

/**
 * Helper Functions
 */

function extractLastPathElement(pathname: string): string {
  const elements = pathname.split("/").filter((el) => el.length > 0);
  return elements[elements.length - 1];
}
