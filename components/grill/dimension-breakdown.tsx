import type { DimensionScore, GrillDimensionId } from "@/lib/grill/types";
import { cn } from "@/lib/utils";

export function DimensionBreakdown({
  dimensions,
  strongest,
  weakest,
}: {
  dimensions: DimensionScore[];
  strongest: GrillDimensionId;
  weakest: GrillDimensionId;
}) {
  return (
    <div className="divide-y divide-black/8 rounded-lg border border-black/10 bg-white">
      {dimensions.map((dimension) => (
        <div className="grid gap-3 p-4 sm:grid-cols-[210px_minmax(0,1fr)_48px] sm:items-center sm:p-5" key={dimension.id}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#171513]">{dimension.label}</h3>
              {dimension.id === strongest ? <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[10px] font-bold text-[#247647]">Strongest</span> : null}
              {dimension.id === weakest ? <span className="rounded-full bg-[#fff0ec] px-2 py-0.5 text-[10px] font-bold text-[#a53f30]">Weakest</span> : null}
            </div>
            <p className="mt-1 text-xs leading-5 text-[#70685f] sm:hidden">{dimension.explanation}</p>
          </div>
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-black/8">
              <div className={cn("h-full rounded-full", dimension.score >= 70 ? "bg-[#37b26c]" : dimension.score >= 45 ? "bg-[#e69a32]" : "bg-[#d34d40]")} style={{ width: `${dimension.score}%` }} />
            </div>
            <p className="mt-2 hidden text-xs leading-5 text-[#70685f] sm:block">{dimension.explanation}</p>
          </div>
          <div className="text-right text-lg font-bold text-[#171513]">{dimension.score}</div>
        </div>
      ))}
    </div>
  );
}
