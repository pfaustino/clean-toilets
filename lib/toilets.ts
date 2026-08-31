import { CITY } from "@/lib/city";
import { SEED_RATINGS, SEED_TOILETS } from "@/lib/seed-toilets";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Rating, Toilet } from "@/lib/types";

function asToilet(row: Toilet): Toilet {
  return {
    ...row,
    lat: Number(row.lat),
    lng: Number(row.lng),
    cleanliness_avg:
      row.cleanliness_avg == null ? null : Number(row.cleanliness_avg),
    rating_count: Number(row.rating_count),
  };
}

export async function listToilets(): Promise<Toilet[]> {
  if (!isSupabaseConfigured()) {
    return SEED_TOILETS;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("toilets")
    .select("*")
    .gte("lat", CITY.bbox.south)
    .lte("lat", CITY.bbox.north)
    .gte("lng", CITY.bbox.west)
    .lte("lng", CITY.bbox.east)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load toilets: ${error.message}`);
  }

  return ((data ?? []) as Toilet[]).map(asToilet);
}

export async function getToilet(id: string): Promise<Toilet | null> {
  if (!isSupabaseConfigured()) {
    return SEED_TOILETS.find((toilet) => toilet.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("toilets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load toilet: ${error.message}`);
  }

  return data ? asToilet(data as Toilet) : null;
}

export async function listRatings(toiletId: string): Promise<Rating[]> {
  if (!isSupabaseConfigured()) {
    return SEED_RATINGS.filter((rating) => rating.toilet_id === toiletId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("toilet_id", toiletId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to load ratings: ${error.message}`);
  }

  return (data ?? []) as Rating[];
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
