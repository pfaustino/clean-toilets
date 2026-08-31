import Link from "next/link";
import { redirect } from "next/navigation";
import { AddToiletFormLoader } from "@/components/AddToiletFormLoader";
import { Header } from "@/components/Header";
import { CITY } from "@/lib/city";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/toilets";

export const dynamic = "force-dynamic";

export default async function NewToiletPage() {
  const configured = isSupabaseConfigured();
  const user = await getCurrentUser();

  if (configured && !user) {
    redirect("/login?next=/toilets/new");
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <p className="text-sm">
          <Link href="/" className="text-teal-800 underline">
            ← All toilets
          </Link>
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-teal-950">
          Add a toilet
        </h1>
        <p className="mt-2 text-sm text-teal-800/80">
          Pin a restroom in {CITY.name} that is missing from the map.
        </p>
        <div className="mt-6 rounded-xl border border-teal-800/10 bg-white p-5">
          {configured && user ? (
            <AddToiletFormLoader userId={user.id} />
          ) : (
            <p className="text-sm text-teal-800">
              Adding toilets needs a configured Supabase project and a signed-in
              account. See the README, then{" "}
              <Link href="/login" className="underline">
                sign in
              </Link>
              .
            </p>
          )}
        </div>
      </main>
    </>
  );
}
