"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  toiletId: string;
  userId: string;
  existing?: { cleanliness: number; comment: string | null } | null;
};

export function RateToiletForm({ toiletId, userId, existing }: Props) {
  const router = useRouter();
  const [cleanliness, setCleanliness] = useState(existing?.cleanliness ?? 4);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const supabase = createClient();
      const { error: saveError } = await supabase.from("ratings").upsert(
        {
          toilet_id: toiletId,
          user_id: userId,
          cleanliness,
          comment: comment.trim() || null,
        },
        { onConflict: "toilet_id,user_id" },
      );
      if (saveError) {
        setStatus("error");
        setError(saveError.message);
        return;
      }
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not save rating");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-teal-950">
          Cleanliness
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setCleanliness(star)}
              className={`text-2xl leading-none ${
                star <= cleanliness ? "text-teal-700" : "text-teal-800/25"
              }`}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label className="text-sm font-medium text-teal-950">
        Comment (optional)
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          maxLength={400}
          className="mt-1 w-full rounded-lg border border-teal-800/20 px-3 py-2 text-sm outline-none ring-teal-700 focus:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={status === "saving"}
        className="self-start rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {status === "saving"
          ? "Saving…"
          : existing
            ? "Update rating"
            : "Submit rating"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
