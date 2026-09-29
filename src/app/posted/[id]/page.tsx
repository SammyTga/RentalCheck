"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PostedInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const [code, setCode] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    const codeKey = `rentalcheck-posted-code-${id}`;
    const seenKey = `rentalcheck-posted-seen-${id}`;
    const fromUrl = search.get("code");

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(seenKey) === "1";
    } catch {
      alreadySeen = false;
    }

    if (fromUrl && !alreadySeen) {
      try {
        sessionStorage.setItem(codeKey, fromUrl);
      } catch {
        /* ignore */
      }
    }
    let shown = "";
    try {
      if (alreadySeen) {
        shown = "";
      } else {
        shown = fromUrl || sessionStorage.getItem(codeKey) || "";
      }
    } catch {
      shown = alreadySeen ? "" : fromUrl || "";
    }

    if (!shown) {
      router.replace("/");
      return;
    }

    if (fromUrl) {
      router.replace(`/posted/${id}`);
    }

    setCode(shown);
    setReady(true);

    function consume() {
      try {
        sessionStorage.setItem(seenKey, "1");
        sessionStorage.removeItem(codeKey);
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("pagehide", consume);
    return () => window.removeEventListener("pagehide", consume);
  }, [id, router, search]);

  if (!ready) {
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-semibold text-stone-900">Post published</h2>
      <p className="mt-3 text-stone-600">
        Save this secret code. You need it to edit or delete the post, or mark
        it as resolved. We will not show it again.
      </p>
      <p className="mt-4 rounded-lg bg-stone-900 px-4 py-3 font-mono text-lg tracking-widest text-white">
        {code}
      </p>
      <p className="mt-6 flex gap-4 text-sm">
        <Link href={`/issues/${id}`} className="underline active:text-teal-800">
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
