"use client";

const SHORT_LABELS = [
  "Communication","Support & Guidance","Feedback","Approachability",
  "Motivation","Problem Solving","Fairness","Recognition","Empowerment","Growth Support",
];

export default function RatingChart({ submissions }) {
  const averages = SHORT_LABELS.map((label, i) => {
    const key = `q${i + 1}`;
    const vals = submissions.map((s) => s[key]).filter(Boolean);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { label, avg: parseFloat(avg.toFixed(2)) };
  });

  const getColor = (avg) => {
    if (avg >= 4.5) return "#22c55e";
    if (avg >= 3.5) return "#F59E0B";
    if (avg >= 2.5) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="space-y-3">
      {averages.map(({ label, avg }) => (
        <div key={label}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-xs font-semibold" style={{ color: getColor(avg) }}>{avg} / 5</span>
          </div>
          <div className="h-2 bg-[#21262D] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(avg / 5) * 100}%`, background: getColor(avg) }} />
          </div>
        </div>
      ))}
    </div>
  );
}
