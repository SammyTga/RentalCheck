"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PostedInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const code = search.get("code");

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-semibold text-stone-900">Post published</h2>
      <p className="mt-3 text-stone-600">
        Save this secret code. You need it to edit or delete the post, or mark
        it as resolved. We will not show it again.
      </p>
      <p className="mt-4 rounded-lg bg-stone-900 px-4 py-3 font-mono text-lg tracking-widest text-white">
        {code || "Check the address bar if this is blank"}
      </p>
      <p className="mt-6 flex gap-4 text-sm">
        <Link href={`/issues/${params.id}`} className="underline active:text-teal-800">
          View post
        </Link>
        <Link href="/" className="underline active:text-teal-800">
          Back to feed
        </Link>
      </p>
    </div>
  );
}

export default function PostedPage() {
  return (
    <Suspense>
      <PostedInner />
    </Suspense>
  );
}
