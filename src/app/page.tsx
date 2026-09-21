import { Feed } from "@/components/Feed";
import { dbConfigured, dbListPublic } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialIssues: Awaited<ReturnType<typeof dbListPublic>> = [];
  try {
    if (dbConfigured()) initialIssues = await dbListPublic();
  } catch {
    initialIssues = [];
  }

  return (
    <div>
      <section className="mb-5 max-w-5xl">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900">
          Check a rental property before you sign or buy
        </h2>
        <p className="mt-3 font-medium text-stone-900">
          Search a street address for issues tenants have logged.
        </p>
      </section>
      <Feed initialIssues={initialIssues} />
    </div>
  );
}
