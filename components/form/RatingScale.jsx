"use client";

const labels = { 1:"Poor", 2:"Below Average", 3:"Average", 4:"Good", 5:"Excellent" };

export default function RatingScale({ value, onChange, error, accentColor="#F59E0B" }) {
  return (
    <div className="mt-4">
      <div className="flex gap-2 sm:gap-3">
        {[1,2,3,4,5].map(num => {
          const isSelected = value === num;
          return (
            <button key={num} type="button" onClick={()=>onChange(num)}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full font-semibold text-sm transition-all duration-200 ease-out focus:outline-none"
              style={{
                background: isSelected ? accentColor : "#1C2333",
                color: isSelected ? "#000" : "#9ca3af",
                border: `1px solid ${isSelected ? accentColor : error ? "rgba(239,68,68,0.5)" : "#21262D"}`,
                transform: isSelected ? "scale(1.1)" : "scale(1)",
                boxShadow: isSelected ? `0 0 16px ${accentColor}55` : "none",
              }}>
              {num}
              {isSelected && <span className="absolute inset-0 rounded-full animate-ping" style={{ background:`${accentColor}33` }}/>}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[11px] text-gray-500">Poor</span>
        {value && <span className="text-[11px] font-medium" style={{ color:accentColor }}>{labels[value]}</span>}
        <span className="text-[11px] text-gray-500">Excellent</span>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">Please select a rating</p>}
    </div>
  );
}
