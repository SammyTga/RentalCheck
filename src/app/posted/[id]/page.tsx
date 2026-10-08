"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function keys(id: string) {
  return {
    code: `rentalcheck-posted-code-${id}`,
    seen: `rentalcheck-posted-seen-${id}`,
  };
}

function markSeen(id: string) {
  const k = keys(id);
  try {
    sessionStorage.setItem(k.seen, "1");
    sessionStorage.removeItem(k.code);
  } catch {
    /* ignore */
  }
}

function PostedInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const [code, setCode] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    const k = keys(id);
    const fromUrl = search.get("code");

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(k.seen) === "1";
    } catch {
      alreadySeen = false;
    }

    if (alreadySeen) {
      router.replace("/");
      return;
    }

    if (fromUrl) {
      try {
        sessionStorage.setItem(k.code, fromUrl);
      } catch {
        /* ignore */
      }
      router.replace(`/posted/${id}`);
    }

    let shown = "";
    try {
      shown = fromUrl || sessionStorage.getItem(k.code) || "";
    } catch {
      shown = fromUrl || "";
    }

    if (!shown) {
      router.replace("/");
      return;
    }

    setCode(shown);
    setReady(true);

    function leave() {
      markSeen(id);
    }
    function onShow(e: PageTransitionEvent) {
      if (e.persisted) {
        markSeen(id);
        setCode("");
        router.replace("/");
      }
    }
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", onShow);
    return () => {
      leave();
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", onShow);
    };
    // search is read once on enter; don't re-run or the code is marked used
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  if (!ready) {
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900">Post published</h2>
      <p className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-stone-800">
        Thank you for contributing to this property's issue history. Your
        report will help future tenants make a more informed decision.
      </p>
      <p className="mt-4 text-stone-600">
        Save this secret code. You need it to edit or delete the post, or mark
        it as resolved. We will not show it again.
      </p>
      <p className="mt-4 rounded-lg bg-stone-900 px-4 py-3 font-mono text-lg tracking-widest text-white">
        {code}
      </p>
      <p className="mt-2 text-sm text-stone-600">The code is case sensitive.</p>
      <p className="mt-6 flex gap-4 text-sm">
        <Link href={`/issues/${id}`} className="underline hover:text-teal-800 active:text-teal-800">
          View post
        </Link>
        <Link href="/" className="underline hover:text-teal-800 active:text-teal-800">
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
