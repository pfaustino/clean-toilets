"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Filters } from "@/components/Filters";
import { ToiletList } from "@/components/ToiletList";
import { matchesFilters } from "@/lib/display";
import type { FeeFilter, Toilet } from "@/lib/types";

const ToiletMap = dynamic(() => import("@/components/ToiletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-teal-50 text-sm text-teal-800">
      Loading map…
    </div>
  ),
});

type Props = {
  toilets: Toilet[];
};

export function SearchView({ toilets }: Props) {
  const [query, setQuery] = useState("");
  const [fee, setFee] = useState<FeeFilter>("all");
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(
    () =>
      toilets.filter((toilet) =>
        matchesFilters(toilet, query, fee, minRating),
      ),
    [toilets, query, fee, minRating],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Filters
        query={query}
        fee={fee}
        minRating={minRating}
        resultCount={filtered.length}
        onQueryChange={setQuery}
        onFeeChange={setFee}
        onMinRatingChange={setMinRating}
      />
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-2">
        <div className="h-[min(50vh,420px)] border-b border-teal-800/10 lg:h-auto lg:min-h-[520px] lg:border-b-0 lg:border-r">
          <ToiletMap toilets={filtered} />
        </div>
        <div className="min-h-0 overflow-y-auto bg-white">
          <ToiletList toilets={filtered} />
        </div>
      </div>
    </div>
  );
}
