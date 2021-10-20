import { createClient } from "https://deno.land/x/supabase@1.2.0/mod.ts";

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = Deno.env.toObject();
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
    .limit(1);

  // console.log(currentFeature); // Debug

  if (error) {
    console.error(
      `Error getting current Feature from supabase: '${JSON.stringify(error)}'`
    );
    return undefined;
  }

  // console.log(data); // debug

  if (!data || data.length === 0) {
    console.log(`No data returned for current Feature from supabase.`);
    return undefined;
  }

  // There should only be one row anyway
  const latest = data[0];
  const currentFeature = { imdbId: latest.imdb_id };

  return currentFeature;
}
