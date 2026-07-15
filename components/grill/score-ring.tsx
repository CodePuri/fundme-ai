export function ScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score));
  return (
    <div
      aria-label={`Funding Readiness Score ${safeScore} out of 100`}
      className="relative flex size-44 shrink-0 items-center justify-center rounded-full p-3"
      style={{ background: `conic-gradient(#ff6b3d ${safeScore * 3.6}deg, rgba(255,255,255,0.12) 0deg)` }}
    >
      <div className="flex size-full flex-col items-center justify-center rounded-full bg-[#171513] text-center">
        <span className="text-6xl font-semibold leading-none text-white" style={{ fontFamily: "var(--font-instrument)" }}>{safeScore}</span>
        <span className="mt-1 text-xs font-bold text-white/55">OUT OF 100</span>
      </div>
    </div>
  );
}
