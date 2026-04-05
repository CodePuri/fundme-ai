"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DashboardFrame } from "@/components/app/dashboard-frame";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramLogo } from "@/components/ui/program-logo";

export default function ExplorePage() {
  const { state } = useDemo();
  const [activeFilter, setActiveFilter] = useState("All");

  const programs = useMemo(() => {
    if (activeFilter === "All") return state.opportunities;
    if (activeFilter === "India") {
      return state.opportunities.filter((program) => program.location.includes("India") || program.location.includes("Mumbai") || program.location.includes("Bengaluru"));
    }
    if (activeFilter === "Global") {
      return state.opportunities.filter((program) => program.location.includes("Global") || program.location.includes("Remote") || program.location.includes("San Francisco"));
    }
    if (activeFilter === "Credits") {
      return state.opportunities.filter((program) => program.type === "Credits");
    }
    return state.opportunities.filter((program) => program.type === activeFilter);
  }, [activeFilter, state.opportunities]);

  return (
    <DashboardFrame>
      <div>
        <div className="eyebrow">All Programs</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.04em] text-white">
          All Programs
        </h1>
        <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-zinc-500">
          Every accelerator, fellowship, and credit program we track.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "Accelerator", "Fellowship", "Credits", "India", "Global"].map((item) => (
          <button
            className={`rounded-full border px-3 py-1.5 text-xs ${
              activeFilter === item ? "border-white bg-white text-black" : "border-zinc-800 bg-zinc-950 text-zinc-500"
            }`}
            key={item}
            onClick={() => setActiveFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[16px] border border-zinc-800 bg-black">
        {programs.map((program) => (
          <div
            className="group grid grid-cols-[1.8fr_0.8fr_0.9fr_1fr_130px] items-center border-b border-zinc-800 px-5 py-4 text-[14px] text-zinc-400 last:border-b-0 hover:bg-zinc-900"
            key={program.slug}
          >
            <div className="flex items-center gap-3">
              <ProgramLogo domain={program.domain} size={36} slug={program.slug} />
              <div>
                <div className="text-white">{program.name}</div>
                <div className="mt-1 max-w-[420px] text-[12px] text-zinc-500">{program.description}</div>
              </div>
            </div>
            <div>
              <Badge size="sm">{program.type}</Badge>
            </div>
            <div>{program.location}</div>
            <div>{program.deadline}</div>
            <div className="flex justify-end">
              <Link href={`/app/programs/${program.slug}`}>
                <Button className="opacity-0 transition-opacity group-hover:opacity-100" variant="ghost">
                  View Details →
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </DashboardFrame>
  );
}
