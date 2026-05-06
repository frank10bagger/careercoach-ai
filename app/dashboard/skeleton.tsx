// Reusable skeleton loader. Pure CSS shimmer (defined in globals.css).

export function GenerateSkeleton({ rows = 8, label }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3 fade-in">
      {label && (
        <p className="text-xs text-slate-500 italic flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {label}
        </p>
      )}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded shimmer"
            style={{ width: `${85 - (i % 4) * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}
