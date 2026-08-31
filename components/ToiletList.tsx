import Link from "next/link";
import { feeLabel, formatAvg } from "@/lib/display";
import type { Toilet } from "@/lib/types";
import { RatingStars } from "@/components/RatingStars";

type Props = {
  toilets: Toilet[];
};

export function ToiletList({ toilets }: Props) {
  if (toilets.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-teal-800/80">
        No toilets match those filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-teal-800/10">
      {toilets.map((toilet) => (
        <li key={toilet.id}>
          <Link
            href={`/toilets/${toilet.id}`}
            className="block px-4 py-3 hover:bg-teal-50/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-teal-950">
                  {toilet.name}
                </p>
                {toilet.address ? (
                  <p className="truncate text-sm text-teal-800/70">
                    {toilet.address}
                  </p>
                ) : null}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  toilet.fee === "free"
                    ? "bg-teal-100 text-teal-900"
                    : toilet.fee === "paid"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {feeLabel(toilet.fee)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-teal-800">
              <RatingStars value={toilet.cleanliness_avg} />
              <span>{formatAvg(toilet.cleanliness_avg)}</span>
              {toilet.rating_count > 0 ? (
                <span className="text-teal-800/60">
                  ({toilet.rating_count})
                </span>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
