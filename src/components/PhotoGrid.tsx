"use client";

import { useEffect, useState } from "react";

export function PhotoGrid({
  photos,
  size = "card",
}: {
  photos: string[];
  size?: "card" | "detail";
}) {
  const [active, setActive] = useState<number | null>(null);
  const clickable = size === "detail";

  useEffect(() => {
    if (active === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") {
        setActive((i) => (i === null || i >= photos.length - 1 ? i : i + 1));
      }
      if (e.key === "ArrowLeft") {
        setActive((i) => (i === null || i <= 0 ? i : i - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, photos.length]);

  if (!photos.length) return null;

  return (
    <>
      {size === "card" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((src, index) => (
            <div
              key={`${src.slice(0, 20)}-${index}`}
              className="h-32 w-32 overflow-hidden rounded-lg bg-stone-100 sm:h-36 sm:w-36"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
          {photos.map((src, index) => (
            <button
              key={`${src.slice(0, 20)}-${index}`}
              type="button"
              className="aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 sm:aspect-auto sm:h-44 sm:w-56"
              onClick={() => setActive(index)}
              aria-label={`Open photo ${index + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {clickable && active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 p-3 sm:p-8"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 text-sm text-white"
            onClick={() => setActive(null)}
          >
            Close
          </button>
          {active > 0 && (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setActive(active - 1);
              }}
            >
              ←
            </button>
          )}
          {active < photos.length - 1 && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-white"
              onClick={(e) => {
                e.stopPropagation();
                setActive(active + 1);
              }}
            >
              →
            </button>
          )}
          <img
            src={photos[active]}
            alt={`Photo ${active + 1}`}
            className="max-h-[92vh] max-w-[96vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
