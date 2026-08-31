import { Header } from "@/components/Header";
import { SearchView } from "@/components/SearchView";
import { listToilets } from "@/lib/toilets";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const toilets = await listToilets();

  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col lg:overflow-hidden">
        <SearchView toilets={toilets} />
      </main>
    </>
  );
}
