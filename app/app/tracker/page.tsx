"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { PageShell } from "@/components/app/page-shell";
import { useDemo } from "@/components/app/demo-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { ProgramLogo } from "@/components/ui/program-logo";
import { StatusBadge, statusTone } from "@/components/ui/status-badge";
import { type Opportunity } from "@/lib/demo-data";

const statusTabs = ["All programs", "Drafting", "Ready", "Submitted", "Interview"];

const modalPrograms: Opportunity[] = [
  {
    slug: "entrepreneur-first-india",
    shortName: "EF",
    name: "Entrepreneur First India",
    domain: "joinef.com",
    type: "Accelerator",
    category: "Pre-team",
    location: "Bengaluru",
    deadline: "Rolling",
    description: "Pre-team pre-idea program that funds founders while they find a cofounder.",
    fitScore: 45,
    fitLabel: "Possible Match",
    why: "Less aligned because Flowstate already has a concrete company and product wedge, but still relevant around solo-founder support.",
    overview: "",
    requirements: [],
    gaps: [],
    signals: [],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-05T12:00:00.000Z",
    lastEdited: "2026-04-05T12:00:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "sequoia-arc",
    shortName: "SA",
    name: "Sequoia Arc",
    domain: "sequoiacap.com",
    type: "Fellowship",
    category: "Founder Support",
    location: "Global",
    deadline: "Rolling",
    description: "Sequoia's early stage scout and support program for pre-seed founders.",
    fitScore: 48,
    fitLabel: "Possible Match",
    why: "",
    overview: "",
    requirements: [],
    gaps: [],
    signals: [],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-05T12:00:00.000Z",
    lastEdited: "2026-04-05T12:00:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "founder-institute",
    shortName: "FI",
    name: "Founder Institute",
    domain: "fi.co",
    type: "Accelerator",
    category: "Global",
    location: "Global",
    deadline: "Rolling",
    description: "Structured pre-seed founder program with weekly milestones and mentor accountability.",
    fitScore: 44,
    fitLabel: "Possible Match",
    why: "",
    overview: "",
    requirements: [],
    gaps: [],
    signals: [],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-05T12:00:00.000Z",
    lastEdited: "2026-04-05T12:00:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "nasscom-deeptech",
    shortName: "ND",
    name: "Nasscom DeepTech",
    domain: "nasscom.in",
    type: "Program",
    category: "India",
    location: "India",
    deadline: "Rolling",
    description: "DeepTech support track for technical startups building IP-heavy products in India.",
    fitScore: 43,
    fitLabel: "Possible Match",
    why: "",
    overview: "",
    requirements: [],
    gaps: [],
    signals: [],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-05T12:00:00.000Z",
    lastEdited: "2026-04-05T12:00:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: true,
  },
  {
    slug: "india-accelerator",
    shortName: "IA",
    name: "India Accelerator",
    domain: "indiaaccelerator.co",
    type: "Accelerator",
    category: "India",
    location: "Gurugram",
    deadline: "Rolling",
    description: "Operator-led accelerator for Indian startups looking for early structure and investor readiness.",
    fitScore: 42,
    fitLabel: "Possible Match",
    why: "",
    overview: "",
    requirements: [],
    gaps: [],
    signals: [],
    status: "Drafting",
    intelligence: null,
    lastUpdated: "2026-04-05T12:00:00.000Z",
    lastEdited: "2026-04-05T12:00:00.000Z",
    questionCount: 0,
    questionsCompleted: 0,
    tracked: true,
  },
];

export default function TrackerPage() {
  const { state, addTrackerProgram } = useDemo();
  const [activeTab, setActiveTab] = useState("All programs");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  const trackedPrograms = useMemo(
    () => [...state.opportunities.filter((item) => item.tracked), ...state.manualTrackerPrograms],
    [state.manualTrackerPrograms, state.opportunities],
  );

  const filteredPrograms = useMemo(() => {
    return trackedPrograms.filter((program) => {
      const matchesStatus =
        activeTab === "All programs" ||
        (activeTab === "Interview" ? program.status === "Interview Scheduled" : program.status === activeTab);

      const matchesSearch = program.name.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [activeTab, search, trackedPrograms]);

  const availablePrograms = useMemo(() => {
    const trackedSlugs = new Set(trackedPrograms.map((item) => item.slug));

    return modalPrograms.filter((program) => {
      const matchesSearch = program.name.toLowerCase().includes(modalSearch.toLowerCase());
      return !trackedSlugs.has(program.slug) && matchesSearch;
    });
  }, [modalSearch, trackedPrograms]);

  const counts = useMemo(() => {
    const base = {
      total: trackedPrograms.length,
      drafting: 0,
      ready: 0,
      submitted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };

    for (const opportunity of trackedPrograms) {
      if (opportunity.status === "Drafting") base.drafting += 1;
      if (opportunity.status === "Ready") base.ready += 1;
      if (opportunity.status === "Submitted") base.submitted += 1;
      if (opportunity.status === "Interview Scheduled") base.interview += 1;
      if (opportunity.status === "Accepted") base.accepted += 1;
      if (opportunity.status === "Rejected") base.rejected += 1;
    }

    return base;
  }, [trackedPrograms]);

  const kpis = [
    { label: "Total", value: counts.total, color: "#111111" },
    { label: "Drafting", value: counts.drafting, color: "#8d8578" },
    { label: "Ready", value: counts.ready, color: "#22c55e" },
    { label: "Submitted", value: counts.submitted, color: "#60a5fa" },
    { label: "Interview", value: counts.interview, color: "#f59e0b" },
    { label: "Accepted", value: counts.accepted, color: "#22c55e" },
    { label: "Rejected", value: counts.rejected, color: "#8d8578" },
  ];

  return (
    <PageShell>
      <div>
        <div className="eyebrow">Tracker</div>
        <h1 className="mt-3 text-[38px] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)]">
          Tracker
        </h1>
        <p className="mt-4 text-[14px] text-[var(--text-muted)]">Every application, every deadline, every status in one place.</p>
      </div>

      <div className="grid gap-3 xl:grid-cols-7">
        {kpis.map((item) => (
          <Panel className="px-4 py-4" key={item.label}>
            <PanelBody className="mt-0">
              <div className="text-[28px] font-semibold tracking-[-0.04em]" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="mt-1 text-[12px] text-[var(--text-faint)]">{item.label}</div>
            </PanelBody>
          </Panel>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            className="app-input h-12 rounded-[10px] pl-11 pr-4 text-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search programs..."
            value={search}
          />
        </div>
        <Button onClick={() => setModalOpen(true)} variant="ghost">
          + Add Program
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((item) => (
          <button
            className={`rounded-full border px-3 py-1.5 text-xs ${
              activeTab === item
                ? "border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
            }`}
            key={item}
            onClick={() => setActiveTab(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden p-0">
        <PanelHeader className="border-b border-[var(--border)] px-4 py-4">
          <PanelTitle>Tracked programs</PanelTitle>
        </PanelHeader>
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] border-b border-[var(--border)] px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
          <div>Program</div>
          <div>Status</div>
          <div>Deadline</div>
          <div>Intelligence</div>
          <div>Last Updated</div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="px-4 py-16 text-center text-[14px] text-[var(--text-faint)]">
            Nothing tracked yet.
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <div
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] items-center border-l-2 px-4 py-4 text-[14px] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)]"
              key={program.slug}
              style={{
                borderLeftColor:
                  program.status === "Submitted"
                    ? "#60a5fa"
                    : program.status === "Interview Scheduled"
                      ? "#f59e0b"
                      : program.status === "Ready"
                        ? "#22c55e"
                        : "#3f3f46",
              }}
            >
              <div className="flex items-center gap-3 text-[var(--text-primary)]">
                <ProgramLogo domain={program.domain} size={36} slug={program.slug} />
                <span>{program.name}</span>
              </div>
              <div>
                <StatusBadge className="text-[11px]" tone={statusTone(program.status)}>
                  {program.status}
                </StatusBadge>
              </div>
              <div>{program.deadline}</div>
              <div>
                {program.slug === "aws-activate" ? (
                  <span className="text-[var(--text-faint)]">Draft complete</span>
                ) : program.intelligence ? (
                  <Badge size="sm" tone="amber">
                    {program.intelligence}
                  </Badge>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div>
                {new Date(program.lastUpdated).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))
        )}
      </Panel>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,17,17,0.18)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-[680px] rounded-[20px] border border-[var(--border)] bg-[var(--bg)] p-6 shadow-[0_24px_80px_rgba(17,17,17,0.12)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  Add a program to your tracker
                </div>
                <div className="mt-2 text-[14px] text-[var(--text-muted)]">
                  Pick a program that is not already being tracked.
                </div>
              </div>
              <button
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--text-faint)]" />
              <input
                className="app-input h-12 rounded-[10px] pl-11 pr-4 text-sm"
                onChange={(event) => setModalSearch(event.target.value)}
                placeholder="Search programs..."
                value={modalSearch}
              />
            </div>

            <div className="mt-6 space-y-3">
              {availablePrograms.map((program) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                  key={program.slug}
                >
                  <div className="flex items-center gap-3">
                    <ProgramLogo domain={program.domain} size={36} slug={program.slug} />
                    <div>
                    <div className="text-[15px] font-medium text-[var(--text-primary)]">{program.name}</div>
                    <div className="mt-1 text-[13px] text-[var(--text-faint)]">{program.type}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      addTrackerProgram(program);
                      setModalOpen(false);
                    }}
                    variant="ghost"
                  >
                    Add to Tracker
                  </Button>
                </div>
              ))}
              {availablePrograms.length === 0 ? (
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-[14px] text-[var(--text-faint)]">
                  No programs match your search. Try a broader term or clear your filters.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
