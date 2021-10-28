import { createClient } from "https://deno.land/x/supabase@1.2.0/mod.ts";
import { LocalStorageMemory } from "./localStorageMemory.ts";

// Authenticate client with Supabase. Authorization is managed by Supabase.
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = Deno.env.toObject();
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "I need environment variables to connect to Supabase: SUPABASE_URL & SUPABASE_SERVICE_KEY"
  );
}

const localStorage = new LocalStorageMemory();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  localStorage,
  persistSession: false,
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

  return data;
}

export async function getSubscriberListFromSupabase() {
  interface TableRow {
    id: number;
    created_at: string;
    name: string;
    email: string;
    sms: string;
    text_email_only: boolean;
  }

  const tableName =
    Deno.env.get("IS_DEV") === "true" ? "dev_subscribers" : "subscribers";

  // Fetch the table row with latest `created_at` value
  const { data, error } = await supabase
    .from<TableRow>(tableName)
    .select("name,email,sms,text_email_only");

  if (error) {
    console.error(
      `Error getting subscriber list from Supabase: '${JSON.stringify(error)}'`
    );
    return undefined;
  }
  if (!data) {
    console.error(`No data returned for subscribers list from Supabase`);
    return undefined;
  }

  return data;
}
