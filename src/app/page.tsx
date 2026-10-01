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
        <p className="font-display text-xl font-medium tracking-tight text-stone-900 sm:text-2xl">
          Search an address for issues tenants have logged.
        </p>
      </section>
      <Feed initialIssues={initialIssues} />
    </div>
  );
}
