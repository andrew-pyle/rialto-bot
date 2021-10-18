import { createClient } from "https://deno.land/x/supabase/mod.ts";

const { SUPABASE_URL, SUPABASE_KEY } = Deno.env.toObject();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * TODO use a better data structure than a table with a single row with a fixed ID.
 * Maybe a table of scrape run results. Also need to create a supabase user & policy to
 * represent the Deno Deploy server
 */
export async function readFeatureFromSupabase() {
  const { data, error } = await supabase
    .from("current_feature")
    .select("id,imdb_id")
    .eq("id", 1);

  // console.log(currentFeature); // Debug

  if (error) {
    console.error(
      `Error getting current Feature from supabase: '${JSON.stringify(error)}'`
    );
    return undefined;
  }

  // console.log(data); // debug

  if (!data || data.length === 0) {
    return undefined;
  }

  const currentFeature = { imdbId: data[0].imdb_id };

  return currentFeature;
}

/**
 * TODO use a better data structure than a table with a single row with a fixed ID.
 */
export async function setFeatureToSupabase(imdbId: string) {
  const { error } = await supabase
    .from("current_feature")
    .update([{ imdb_id: imdbId }])
    .eq("id", 1);

  if (error) {
    console.error(
      `Error setting new Feature in Supabase: '${JSON.stringify(error)}'`
    );
  }
}
