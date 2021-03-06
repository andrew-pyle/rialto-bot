const IMDB_API_URL = "https://imdb-api.com/en/API";

// Load Environment Variables
const IMDB_API_KEY = Deno.env.get("IMDB_API_KEY");
if (!IMDB_API_KEY) {
  throw new Error(
    `I need environment variables to lookup IMDB Data: IMDB_API_KEY`
  );
}

export async function fetchImdbData(id: string): Promise<string> {
  const imdbApiResponse = await fetch(
    `${IMDB_API_URL}/Title/${IMDB_API_KEY}/${id}`
  );

  if (!imdbApiResponse.ok) {
    throw new Error(`Imdb API didn't send any data for IMDB id=${id}.`);
  }

  const movieData: unknown = await imdbApiResponse.json();

  if (!isUseableImdbApiResponse(movieData)) {
    throw new Error("Response from imdb-api was not parseable");
  }
  const displayData = movieData?.fullTitle ?? "Unknown Movie";

  if (!(typeof displayData === "string")) {
    throw new Error(
      `Movie Title from IMDB API was not a string: ${JSON.stringify(
        displayData
      )}`
    );
  }

  return displayData;
}

function isUseableImdbApiResponse(
  json: unknown
): json is Record<string, unknown> {
  if (!(typeof json === "object" && json !== null)) {
    throw new Error("Response from imdb-api was not parseable");
  }
  return "fullTitle" in json;
}
