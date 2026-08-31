import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { LoginForm } from "@/components/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/toilets";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const configured = isSupabaseConfigured();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-teal-950">Sign in</h1>
        <p className="mt-2 text-sm text-teal-800/80">
          Use a magic link to rate toilets or add one the map is missing.
          Browsing stays public.
        </p>
        <div className="mt-6 rounded-xl border border-teal-800/10 bg-white p-5">
          {configured ? (
            <Suspense fallback={<p className="text-sm text-teal-800">Loading…</p>}>
              <LoginForm />
            </Suspense>
          ) : (
            <p className="text-sm text-teal-800">
              Sign-in needs a Supabase project. Copy{" "}
              <code className="rounded bg-teal-50 px-1">.env.example</code> to{" "}
              <code className="rounded bg-teal-50 px-1">.env.local</code> and
              add your keys. See the README.
            </p>
          )}
        </div>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-teal-800 underline">
            Back to the map
          </Link>
        </p>
      </main>
    </>
  );
}
