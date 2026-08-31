export type Fee = "free" | "paid" | "unknown";
export type ToiletSource = "osm" | "user";

export type Toilet = {
  id: string;
  osm_id: string | null;
  source: ToiletSource;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  fee: Fee;
  cleanliness_avg: number | null;
  rating_count: number;
  created_by: string | null;
  created_at: string;
};

export type Rating = {
  id: string;
  toilet_id: string;
  user_id: string;
  cleanliness: number;
  comment: string | null;
  created_at: string;
};

export type FeeFilter = "all" | "free" | "paid";
