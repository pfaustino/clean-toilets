import type { Fee, FeeFilter, Toilet } from "@/lib/types";

export function feeLabel(fee: Fee): string {
  if (fee === "free") return "Free";
  if (fee === "paid") return "Paid";
  return "Unknown";
}

export function pinColor(avg: number | null): string {
  if (avg == null) return "#64748b";
  if (avg >= 4) return "#0f766e";
  if (avg >= 3) return "#ca8a04";
  return "#b91c1c";
}

export function formatAvg(avg: number | null): string {
  if (avg == null) return "Unrated";
  return avg.toFixed(1);
}

export function matchesFilters(
  toilet: Toilet,
  query: string,
  fee: FeeFilter,
  minRating: number,
): boolean {
  if (fee !== "all" && toilet.fee !== fee) {
    return false;
  }
  if (minRating > 0) {
    if (toilet.cleanliness_avg == null || toilet.cleanliness_avg < minRating) {
      return false;
    }
  }
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const haystack = `${toilet.name} ${toilet.address ?? ""}`.toLowerCase();
  return haystack.includes(q);
}
