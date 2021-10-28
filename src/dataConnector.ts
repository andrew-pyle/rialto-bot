import {
  pushScrapeDataToSupabase,
  getCurrentScrapeDataFromSupabase,
  getSubscriberListFromSupabase,
} from "./supabaseClient.ts";
import type { Feature } from "./main.ts";
import type { Subscriber } from "./notification.ts";

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
  const row = await getCurrentScrapeDataFromSupabase();
  // Use Application types
  const currentFeature = row ? { imdbId: row.imdb_id } : undefined;
  return currentFeature;
}

export async function getSubscribers(): Promise<Subscriber[] | undefined> {
  // Use Application types
  const rows = await getSubscriberListFromSupabase();
  const subscribers = rows?.map<Subscriber>((row) => ({
    email: row.email,
    name: row.email,
    textOnly: row.text_email_only,
  }));
  return subscribers;
}
