import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { RateToiletForm } from "@/components/RateToiletForm";
import { RatingStars } from "@/components/RatingStars";
import { feeLabel, formatAvg } from "@/lib/display";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser, getToilet, listRatings } from "@/lib/toilets";

export const dynamic = "force-dynamic";

export default async function ToiletPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [toilet, ratings, user] = await Promise.all([
    getToilet(id),
    listRatings(id),
    getCurrentUser(),
  ]);

  if (!toilet) {
    notFound();
  }

  const existing = user
    ? ratings.find((rating) => rating.user_id === user.id)
    : null;
  const configured = isSupabaseConfigured();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <p className="text-sm">
          <Link href="/" className="text-teal-800 underline">
            ← All toilets
          </Link>
        </p>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-teal-950">
              {toilet.name}
            </h1>
            {toilet.address ? (
              <p className="mt-1 text-teal-800/80">{toilet.address}</p>
            ) : null}
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
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

        <div className="mt-4 flex items-center gap-2 text-teal-900">
          <RatingStars value={toilet.cleanliness_avg} size="md" />
          <span className="font-medium">
            {formatAvg(toilet.cleanliness_avg)}
          </span>
          <span className="text-sm text-teal-800/70">
            {toilet.rating_count}{" "}
            {toilet.rating_count === 1 ? "rating" : "ratings"}
          </span>
        </div>

        <p className="mt-2 text-xs text-teal-800/60">
          {toilet.source === "osm" ? "From OpenStreetMap" : "Added by a user"}
        </p>

        <section className="mt-8 rounded-xl border border-teal-800/10 bg-white p-5">
          <h2 className="text-lg font-semibold text-teal-950">
            Rate cleanliness
          </h2>
          {user && configured ? (
            <div className="mt-3">
              <RateToiletForm
                toiletId={toilet.id}
                userId={user.id}
                existing={
                  existing
                    ? {
                        cleanliness: existing.cleanliness,
                        comment: existing.comment,
                      }
                    : null
                }
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-teal-800">
              <Link href="/login" className="underline">
                Sign in
              </Link>{" "}
              to rate this toilet.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-teal-950">Comments</h2>
          {ratings.filter((rating) => rating.comment).length === 0 ? (
            <p className="mt-2 text-sm text-teal-800/80">No comments yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {ratings
                .filter((rating) => rating.comment)
                .map((rating) => (
                  <li
                    key={rating.id}
                    className="rounded-lg border border-teal-800/10 bg-white p-3"
                  >
                    <div className="flex items-center gap-2">
                      <RatingStars value={rating.cleanliness} />
                      <span className="text-xs text-teal-800/60">
                        {new Date(rating.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-teal-950">
                      {rating.comment}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
