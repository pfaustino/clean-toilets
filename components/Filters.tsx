import type { FeeFilter } from "@/lib/types";

type Props = {
  query: string;
  fee: FeeFilter;
  minRating: number;
  resultCount: number;
  onQueryChange: (value: string) => void;
  onFeeChange: (value: FeeFilter) => void;
  onMinRatingChange: (value: number) => void;
};

const FEE_OPTIONS: { value: FeeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function Filters({
  query,
  fee,
  minRating,
  resultCount,
  onQueryChange,
  onFeeChange,
  onMinRatingChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-teal-800/10 bg-white px-4 py-3">
      <label className="block">
        <span className="sr-only">Search by name or address</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name or address"
          className="w-full rounded-lg border border-teal-800/20 bg-teal-50/40 px-3 py-2 text-sm text-teal-950 outline-none ring-teal-700 placeholder:text-teal-800/50 focus:ring-2"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-teal-50 p-0.5">
          {FEE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFeeChange(option.value)}
              className={`rounded-full px-3 py-1 text-sm ${
                fee === option.value
                  ? "bg-teal-700 text-white"
                  : "text-teal-900 hover:bg-teal-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-teal-900">
          Min rating
          <select
            value={minRating}
            onChange={(event) => onMinRatingChange(Number(event.target.value))}
            className="rounded-lg border border-teal-800/20 bg-white px-2 py-1 text-sm"
          >
            <option value={0}>Any</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5</option>
          </select>
        </label>
        <p className="ml-auto text-xs text-teal-800/70">
          {resultCount} {resultCount === 1 ? "toilet" : "toilets"}
        </p>
      </div>
    </div>
  );
}
