export default function ArticleLoadingPage() {
  return (
    <article className="max-w-4xl mx-auto py-20 px-8 space-y-10 animate-in fade-in duration-1000">
      {/* Title */}
      <div className="space-y-4">
        <div className="h-14 w-3/4 rounded-2xl skeleton-shimmer" />
        <div className="h-6 w-48 rounded-xl skeleton-shimmer opacity-60" />
      </div>
      
      {/* Body paragraphs */}
      <div className="space-y-4 pt-10 border-t border-zinc-100 dark:border-zinc-800">
        {[100, 90, 95, 80, 100, 70, 88].map((w, i) => (
          <div key={i} className="h-4 rounded-full skeleton-shimmer" style={{ width: `${w}%` }} />
        ))}
      </div>

      <div className="space-y-4">
        {[85, 100, 60, 92, 75].map((w, i) => (
          <div key={i} className="h-4 rounded-full skeleton-shimmer" style={{ width: `${w}%` }} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-64 w-full rounded-3xl skeleton-shimmer my-10" />
        {[100, 88, 94, 70].map((w, i) => (
          <div key={i} className="h-4 rounded-full skeleton-shimmer" style={{ width: `${w}%` }} />
        ))}
      </div>
    </article>
  );
}
