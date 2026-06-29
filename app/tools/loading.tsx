export default function ToolsLoadingPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background flex flex-col">
      {/* Background Gradients — matches ToolLayout */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 py-8 md:py-16 flex flex-col flex-1">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Main content skeleton */}
          <div className="flex-1 flex flex-col">
            {/* Title skeleton */}
            <div className="mb-8 md:mb-12 space-y-4">
              <div className="h-10 md:h-14 w-2/3 rounded-2xl skeleton-shimmer" />
              <div className="h-5 w-1/2 rounded-xl skeleton-shimmer" />
            </div>

            {/* Tool card skeleton */}
            <div className="bg-white dark:bg-[#232333] rounded-[2.5rem] p-10 shadow-sm flex-1 space-y-10 border border-zinc-50 dark:border-none">
              {/* Upload zone skeleton */}
              <div className="h-64 w-full rounded-[2rem] skeleton-shimmer" />

              {/* Options row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="h-14 rounded-2xl skeleton-shimmer" />
                <div className="h-14 rounded-2xl skeleton-shimmer" />
                <div className="h-14 rounded-2xl skeleton-shimmer col-span-2 md:col-span-1" />
              </div>

              {/* Action button skeleton */}
              <div className="h-16 w-full rounded-2xl skeleton-shimmer opacity-80" />

              {/* Results area skeleton */}
              <div className="space-y-4 mt-6">
                <div className="h-5 w-3/4 rounded-xl skeleton-shimmer" />
                <div className="h-5 w-1/2 rounded-xl skeleton-shimmer" />
                <div className="h-5 w-2/3 rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-[320px] flex flex-col gap-6 flex-shrink-0 mt-8 lg:mt-0">
            {/* Ad unit skeleton */}
            <div className="h-[250px] w-full rounded-2xl skeleton-shimmer" />

            {/* Info card skeleton */}
            <div className="bg-white dark:bg-[#232333] rounded-[2rem] p-8 space-y-6 shadow-sm border border-zinc-50 dark:border-none">
              <div className="h-6 w-2/3 rounded-xl skeleton-shimmer" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-full rounded-lg skeleton-shimmer" style={{ width: `${70 + i * 5}%` }} />
                ))}
              </div>
            </div>
          </aside>

        </div>

        {/* Bottom banner skeleton */}
        <div className="w-full flex justify-center py-10 mt-12 border-t border-border/40">
          <div className="h-[90px] w-[728px] max-w-full rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
