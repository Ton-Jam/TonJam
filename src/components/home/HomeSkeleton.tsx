import React from "react";

export const HomeSectionSkeleton: React.FC<{
  type?: "horizontal-cards" | "vertical-rows" | "grid" | "banner";
  count?: number;
}> = ({ type = "horizontal-cards", count = 5 }) => {
  if (type === "banner") {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full h-44 rounded-2xl bg-zinc-900/60 animate-pulse" />
      </div>
    );
  }

  if (type === "vertical-rows") {
    return (
      <div className="space-y-3 px-4 sm:px-6 lg:px-8">
        <div className="h-5 w-40 bg-zinc-900/70 rounded-lg animate-pulse" />
        <div className="rounded-2xl bg-zinc-900/40 p-3 space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/60 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-2/5" />
                <div className="h-2.5 bg-zinc-800/80 rounded w-1/4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "grid") {
    return (
      <div className="space-y-3 px-4 sm:px-6 lg:px-8">
        <div className="h-5 w-44 bg-zinc-900/70 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-900/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 bg-zinc-900/70 rounded-lg animate-pulse" />
        <div className="h-4 w-12 bg-zinc-900/50 rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-3 overflow-hidden pb-2">
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i} 
            style={{
              width: 'var(--card-width, 168px)',
              borderRadius: 'var(--card-radius, 12px)',
              padding: 'var(--card-padding, 10px)',
            }}
            className="w-[168px] shrink-0 p-[10px] rounded-[12px] bg-white/[0.02] flex flex-col"
          >
            <div 
              style={{ borderRadius: 'var(--card-image-radius, 10px)' }}
              className="w-full aspect-square rounded-[10px] bg-zinc-900/60 animate-pulse" 
            />
            <div 
              style={{ marginTop: 'var(--card-content-gap, 6px)' }}
              className="mt-[6px] space-y-1.5"
            >
              <div className="h-3.5 bg-zinc-900 rounded w-4/5 animate-pulse" />
              <div className="h-2.5 bg-zinc-900/70 rounded w-3/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
