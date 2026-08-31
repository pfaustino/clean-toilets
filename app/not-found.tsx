import { Header } from "@/components/Header";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-teal-950">
          Toilet not found
        </h1>
        <p className="mt-2 text-sm text-teal-800/80">
          That listing is missing, or the link is wrong.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
        >
          Back to the map
        </Link>
      </main>
    </>
  );
}
