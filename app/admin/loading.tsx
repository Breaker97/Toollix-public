export default function AdminLoadingPage() {
  return (
    <div className="p-8 space-y-8 max-w-5xl animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-56 rounded-2xl skeleton-shimmer" />
        <div className="h-9 w-28 rounded-xl skeleton-shimmer" />
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#232333] rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="h-12 w-12 rounded-2xl skeleton-shimmer" />
            <div className="space-y-3">
                <div className="h-4 w-3/4 rounded-lg skeleton-shimmer" />
                <div className="h-10 w-1/2 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-white dark:bg-[#232333] rounded-[2.5rem] p-10 space-y-8 shadow-sm">
        <div className="h-8 w-64 rounded-xl skeleton-shimmer" />
        <div className="h-[400px] w-full rounded-[2rem] skeleton-shimmer" />
      </div>
    </div>
  );
}
