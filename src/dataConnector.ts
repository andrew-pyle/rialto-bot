import {
  pushScrapeDataToSupabase,
  getCurrentScrapeDataFromSupabase,
} from "./supabaseClient.ts";
import type { Feature } from "./main.ts";

export function isFeature(val: unknown): val is Feature {
  return (
    val !== null &&
    typeof val === "object" &&
    typeof (val as Feature)?.imdbId === "string"
  );
}

export async function setFeature(feature: Feature): Promise<void> {
  return await pushScrapeDataToSupabase(feature.imdbId);
}

export async function getFeature(): Promise<Feature | undefined> {
  return await getCurrentScrapeDataFromSupabase();
}
