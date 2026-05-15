"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function QuestionCard({ number, question, answered, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), number * 80);
    return () => clearTimeout(timer);
  }, [number]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-5 sm:p-6 border
        transition-all duration-500 ease-out
        ${answered ? "border-amber-500/40 bg-[#161B22]" : "border-[#21262D] bg-[#161B22] hover:border-[#30363D]"}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{ transitionDelay: `${number * 60}ms` }}
    >
      <span
        className="absolute top-2 left-3 text-7xl sm:text-8xl font-bold text-white/[0.04] select-none pointer-events-none leading-none"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {String(number).padStart(2, "0")}
      </span>

      {answered && (
        <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-amber-500 rounded-full" />
      )}

      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-sm sm:text-base text-gray-200 leading-relaxed pr-6">
          <span className="text-amber-500 font-semibold mr-2">{number}.</span>
          {question}
        </p>
        {answered && <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />}
      </div>

      {children}
    </div>
  );
}
