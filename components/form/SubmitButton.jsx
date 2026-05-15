"use client";

export default function SubmitButton({ loading, accentColor="#F59E0B" }) {
  return (
    <button type="submit" disabled={loading}
      className="relative w-full py-4 rounded-xl font-semibold text-base overflow-hidden transition-all duration-300 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ background:loading?"#374151":`linear-gradient(135deg,${accentColor}cc,${accentColor},${accentColor}dd)`, color:loading?"#9ca3af":"#000" }}>
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Submitting...
          </>
        ) : "Submit Review"}
      </span>
    </button>
  );
}
