"use client";

export default function ProgressBar({ progress }) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#21262D]">
      <div
        className="h-full transition-all duration-500 ease-out relative"
        style={{
          width: `${clamped}%`,
          background: "linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B)",
          backgroundSize: "200% 100%",
          animation: clamped > 0 ? "shimmer 2s linear infinite" : "none",
        }}
      >
        {clamped > 5 && (
          <span className="absolute -top-6 right-0 text-[10px] text-amber-400 font-medium bg-[#0D1117] px-1 rounded">
            {Math.round(clamped)}%
          </span>
        )}
      </div>
    </div>
  );
}
