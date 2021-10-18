const DATA_FILE_PATH = "./rialto-data.json";

interface Feature {
  imdbId: string;
}

export async function setFeature(feature: Feature): Promise<void> {
  await Deno.writeTextFile(
    DATA_FILE_PATH,
    JSON.stringify({ imdbId: feature.imdbId }),
  );
}

export async function getFeature(): Promise<Feature | undefined> {
  let feature: Feature;
  try {
    const json = JSON.parse(
      await Deno.readTextFile(DATA_FILE_PATH),
    ) as Feature;
    feature = json;
  } catch (err) {
    // Short-circuit if there is no data file created yet.
    // Just treat it as a new feature.
    if (err instanceof Deno.errors.NotFound) {
      return undefined;
    }
    // Unexpected Errors
    console.error(err);
    return undefined;
  }

  return feature;
}
