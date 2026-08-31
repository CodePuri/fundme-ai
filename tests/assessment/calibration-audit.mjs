import { assessSession } from "../../lib/assessment/engine.ts";

export const FIXTURES = [
  {
    name: "1. Idea only (Weak / Pre-revenue)",
    input: {
      founderName: "Alex Vance",
      founderRole: "Founder",
      startupName: "IdeaDrop",
      description: "Social shopping app where friends share wishlists. Pre-launch, no revenue yet.",
    },
    artifacts: [],
    answers: {},
  },
  {
    name: "2. Strong founder / Idea stage",
    input: {
      founderName: "Priya Sharma",
      founderRole: "Former AI Research Lead at Google DeepMind",
      startupName: "NexusAI",
      profileText: "10 years leading machine learning infrastructure at DeepMind and Stanford PhD in Distributed Systems.",
      description: "Enterprise autonomous agent orchestration platform for banking workflows. Currently architecting prototype.",
    },
    artifacts: [],
    answers: {},
  },
  {
    name: "3. Prototype with pilots",
    input: {
      founderName: "Marcus Vance",
      founderRole: "Founder & CTO",
      startupName: "HealthSync",
      websiteUrl: "https://healthsync.health",
      extractedWebsiteText: "HIPAA-compliant patient data routing. 3 hospital pilot agreements signed with Mayo Clinic and Cleveland Clinic.",
      description: "HealthSync automates clinical data interoperability across legacy EHR systems. 3 hospital enterprise pilots active.",
    },
    artifacts: [],
    answers: {},
  },
  {
    name: "4. Early revenue",
    input: {
      founderName: "Elena Rostova",
      founderRole: "Founder",
      startupName: "CloudCost",
      websiteUrl: "https://cloudcost.io",
      extractedWebsiteText: "Automated AWS cost optimization. $4,500 MRR from 22 paying engineering teams with 15% MoM growth.",
      description: "CloudCost saves engineering teams 30% on AWS bills automatically. Live product with $4.5k MRR and 22 paying customers.",
    },
    artifacts: [],
    answers: {},
  },
  {
    name: "5. Strong revenue, weak narrative",
    input: {
      founderName: "Anonymous Founder",
      startupName: "SaaSFlow",
      description: "B2B billing webhook pipeline. $60,000 MRR, 120 customers.",
    },
    artifacts: [],
    answers: {},
  },
  {
    name: "6. Seed-ready company (DataPulse)",
    input: {
      founderName: "Rohan Mehta",
      founderRole: "Repeat Founder & CEO",
      startupName: "DataPulse",
      websiteUrl: "https://datapulse.com",
      extractedWebsiteText: "Real-time database performance observability for FinTech. $25,000 MRR, 15 enterprise logos, 20% MoM growth.",
      profileText: "Exited previous SaaS company to Datadog for $14M in 2023. 12 years database engineering experience.",
      description: "DataPulse delivers sub-millisecond query performance monitoring for high-frequency trading and fintech. $300k ARR run rate across 15 enterprise clients.",
    },
    artifacts: [
      {
        kind: "pitch-deck",
        name: "DataPulse_Seed_Deck.pdf",
        status: "attached",
        pageCount: 12,
        detectedSections: ["problem", "solution", "traction", "team", "business-model", "funding-ask"],
        extractedText: "DataPulse Seed Round: Raising $2.5M for 18 months runway to scale enterprise sales from $300k to $1.5M ARR.",
      },
    ],
    answers: {},
  },
  {
    name: "7. Conflicting / unreliable evidence",
    input: {
      founderName: "Sam Fraud",
      startupName: "HyperGrowth",
      description: "Pre-launch stealth idea with zero customers, but we generate $500k monthly recurring revenue.",
    },
    artifacts: [],
    answers: {},
  },
];

console.log("=== CURRENT ENGINE OUTPUTS ===");
for (const f of FIXTURES) {
  const session = {
    version: 1, mode: "demo", stage: "mentor",
    input: {
      founderName: f.input.founderName || "",
      founderRole: f.input.founderRole || "",
      startupName: f.input.startupName || "",
      websiteUrl: f.input.websiteUrl || "",
      linkedInUrl: "",
      description: f.input.description || "",
      profileText: f.input.profileText || "",
      extractedWebsiteText: f.input.extractedWebsiteText || "",
      websiteTitle: f.input.startupName || "",
      websiteDescription: f.input.description || "",
    },
    artifacts: f.artifacts || [],
    conversation: [], answers: f.answers || {}, skippedQuestionIds: [],
    reviewedAt: "2026-08-30T00:00:00.000Z", report: null,
    earlyAccess: { email: "", status: "idle", referralCode: null }, persistenceWarning: null,
    updatedAt: "2026-08-30T00:00:00.000Z",
  };
  const rep = assessSession(session, "2026-08-30T00:00:00.000Z");
  console.log(`----------------------------------------------------`);
  console.log(`${f.name} => Score: ${rep.readinessScore}/100 | Verdict: ${rep.verdict} | Confidence: ${rep.confidence}`);
  console.log(`  Strongest: ${rep.strongestDimension} (${rep.dimensions.find(d => d.id === rep.strongestDimension)?.score})`);
  console.log(`  Weakest:   ${rep.weakestDimension} (${rep.dimensions.find(d => d.id === rep.weakestDimension)?.score})`);
}
