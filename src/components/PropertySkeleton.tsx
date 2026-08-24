import React from "react";

export default function PropertySkeleton() {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-pulse border border-stone-200 dark:border-stone-700">
      {/* Image Skeleton */}
      <div className="w-full h-40 sm:h-48 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 animate-shimmer" />

      {/* Content Skeleton */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-4 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-lg w-3/4" />

        {/* Price Skeleton */}
        <div className="h-5 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 dark:from-amber-900 dark:via-amber-800 dark:to-amber-900 rounded-lg w-1/2" />

        {/* Details Grid Skeleton */}
        <div className="grid grid-cols-3 gap-2 text-[11px] pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-full" />
              <div className="h-3 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-4/5" />
            </div>
          ))}
        </div>

        {/* Button Skeleton */}
        <div className="h-8 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-lg w-full mt-3" />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-shimmer {
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
