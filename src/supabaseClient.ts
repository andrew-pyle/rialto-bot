import { createClient } from "https://deno.land/x/supabase@1.2.0/mod.ts";
import { LocalStorageMemory } from "./localStorageMemory.ts";

const memoryStorage = new LocalStorageMemory();

// Authenticate client with Supabase. Authorization is managed by Supabase.
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = Deno.env.toObject();
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "I need environment variables to send an email: SUPABASE_URL & SUPABASE_SERVICE_KEY"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  persistSession: false,
  localStorage: memoryStorage,
  detectSessionInUrl: false,
});

export async function pushScrapeDataToSupabase(imdbId: string) {
  const { error } = await supabase
    .from("rialto_website_scrapes")
    .insert([{ imdb_id: imdbId }]);

  if (error) {
    console.error(
      `Error saving scrape run data to Supabase: ${JSON.stringify(error)}`
    );
  }
}

export async function getCurrentScrapeDataFromSupabase() {
  interface TableRow {
    id: number;
    created_at: string; // timestamp with offset
    imdb_id: string;
  }

  // Fetch the table row with latest `created_at` value
  const { data, error } = await supabase
    .from<TableRow>("rialto_website_scrapes")
    .select("id,created_at,imdb_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // console.log(currentFeature); // Debug

  if (error) {
    console.error(
      `Error getting current Feature from Supabase: '${JSON.stringify(error)}'`
    );
    return undefined;
  }

  // console.log(data); // debug

  if (!data) {
    console.log(`No data returned for current Feature from Supabase.`);
    return undefined;
  }

  // There should only be one row
  const currentFeature = { imdbId: data.imdb_id };

  return currentFeature;
}
