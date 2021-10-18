import { toFileUrl } from "https://deno.land/std@0.108.0/path/mod.ts";
import {
  readFeatureFromSupabase,
  setFeatureToSupabase,
} from "./supabaseClient.ts";

// Get the path to the user's home directory via a file:// URL.
const DATA_FILE_NAME = "rialto-feature.json";
const USER_HOME_DIR = toFileUrl(Deno.env.get("HOME") as string) + "/"; // ?? why do we need the extra '/'?
const DATA_FILE_PATH = new URL(DATA_FILE_NAME, USER_HOME_DIR);

// console.log(DATA_FILE_PATH); // Debug

export interface Feature {
  imdbId: string;
}

export function isFeature(val: unknown): val is Feature {
  return (
    val !== null &&
    typeof val === "object" &&
    typeof (val as Feature)?.imdbId === "string"
  );
}

export async function setFeature(feature: Feature): Promise<void> {
  // return await setFeatureToLocalFile(DATA_FILE_PATH, feature);
  return await setFeatureToSupabase(feature.imdbId);
}

export async function getFeature(): Promise<Feature | undefined> {
  // return await readFeatureFromLocalFile(DATA_FILE_PATH);
  return await readFeatureFromSupabase();
}

async function setFeatureToLocalFile(path: URL, feature: Feature) {
  return await Deno.writeTextFile(
    path,
    JSON.stringify({ imdbId: feature.imdbId })
  );
}

async function readFeatureFromLocalFile(path: URL) {
  let feature: Feature;
  try {
    const json = JSON.parse(await Deno.readTextFile(path)) as Feature;
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
