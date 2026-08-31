import Link from "next/link";
import { CITY } from "@/lib/city";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/toilets";

export async function Header() {
  const user = await getCurrentUser();
  const configured = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-teal-800/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-teal-900">
            Lurker's Clean Toilets
          </p>
          <p className="text-xs text-teal-800/70">{CITY.name}</p>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 text-sm">
          {user ? (
            <>
              <Link
                href="/toilets/new"
                className="rounded-full bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800"
              >
                Add toilet
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-teal-900 hover:bg-teal-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-teal-700 px-3 py-1.5 font-medium text-white hover:bg-teal-800"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
      {!configured ? (
        <p className="border-t border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
          Showing sample {CITY.name} toilets. Add Supabase keys to enable
          sign-in, ratings, and the OSM import.
        </p>
      ) : null}
    </header>
  );
}
