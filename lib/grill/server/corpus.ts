import type { KnowledgeCorpusItem } from "../types";

export const grillKnowledgeCorpus: KnowledgeCorpusItem[] = [
  {
    id: "yc-application-specificity-v1",
    title: "Specific founder and company answers",
    source: "https://www.ycombinator.com/howtoapply",
    provenance: "Fundme summary of public Y Combinator application guidance",
    category: "application",
    tags: ["application", "specificity", "founder", "clarity", "facts"],
    guidance:
      "Use direct, concrete answers. Replace category language with what the company does, who uses it, and what has happened so far.",
  },
  {
    id: "sequoia-story-structure-v1",
    title: "A coherent pitch narrative",
    source: "https://www.sequoiacap.com/article/writing-a-business-plan/",
    provenance: "Fundme summary of Sequoia Capital's public business-plan guidance",
    category: "deck",
    tags: ["deck", "problem", "solution", "market", "competition", "team", "funding"],
    guidance:
      "A pitch should connect purpose, problem, solution, timing, market, competition, business model, team, financials, and vision into one testable story.",
  },
  {
    id: "techstars-team-market-progress-v1",
    title: "Team, market, and demonstrated progress",
    source: "https://www.techstars.com/the-lineup",
    provenance: "Fundme summary of public Techstars founder and accelerator guidance",
    category: "founder",
    tags: ["founder", "team", "market", "traction", "accelerator", "progress"],
    guidance:
      "Show why this team can learn quickly in this market. Evidence of execution and customer learning is stronger than credentials alone.",
  },
  {
    id: "fundme-traction-evidence-v1",
    title: "Traction needs a denominator and a period",
    source: "Fundme methodology: fundme-v1-demo-rubric@1",
    provenance: "Fundme-owned rubric guidance",
    category: "traction",
    tags: ["traction", "revenue", "users", "pilots", "retention", "growth", "evidence"],
    guidance:
      "State the metric, time period, population, and source. For pre-launch companies, report validated learning and commitments without relabeling them as traction.",
  },
  {
    id: "fundme-market-wedge-v1",
    title: "Start with a defensible market wedge",
    source: "Fundme methodology: fundme-v1-demo-rubric@1",
    provenance: "Fundme-owned rubric guidance",
    category: "market",
    tags: ["market", "customer", "segment", "wedge", "bottom-up", "beachhead"],
    guidance:
      "Name the first reachable customer segment, the number of plausible buyers, and the buying trigger before presenting a broad top-down market total.",
  },
  {
    id: "fundme-profile-authority-v1",
    title: "Founder profiles should establish authority quickly",
    source: "Fundme methodology: founder positioning",
    provenance: "Fundme-owned founder-profile guidance",
    category: "positioning",
    tags: ["linkedin", "profile", "founder", "authority", "achievement", "positioning"],
    guidance:
      "A founder profile should connect role, domain, proof of execution, and current mission. Quantified outcomes beat adjective-heavy summaries.",
  },
  {
    id: "synthetic-claim-rewrite-v1",
    title: "Synthetic example: unsupported claim rewrite",
    source: "Fundme synthetic annotated example",
    provenance: "Synthetic example written for this demo; not a real or accepted application",
    category: "application",
    tags: ["claim", "unsupported", "rewrite", "evidence", "clarity"],
    guidance:
      "Rewrite 'the fastest-growing platform' as a measured statement such as 'weekly active teams grew from X to Y between two named dates,' then cite the source.",
  },
  {
    id: "synthetic-funding-milestones-v1",
    title: "Synthetic example: connect the raise to milestones",
    source: "Fundme synthetic annotated example",
    provenance: "Synthetic example written for this demo; not a real or accepted application",
    category: "funding",
    tags: ["funding", "ask", "use of funds", "milestone", "runway"],
    guidance:
      "Tie the amount raised to a time horizon and two or three measurable de-risking milestones, rather than listing departments that will receive budget.",
  },
];
