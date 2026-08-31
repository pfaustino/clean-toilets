"use client";

import dynamic from "next/dynamic";

const AddToiletForm = dynamic(() => import("@/components/AddToiletForm"), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-teal-800">Loading map picker…</p>
  ),
});

export function AddToiletFormLoader({ userId }: { userId: string }) {
  return <AddToiletForm userId={userId} />;
}
