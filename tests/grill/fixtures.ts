import type { ArtifactResult, GrillIntake } from "../../lib/grill/types";

export const strongIntake: GrillIntake = {
  founder: {
    fullName: "Aisha Rao",
    role: "Founder and CEO",
    background:
      "Eight years building B2B payments and underwriting products for Indian small businesses.",
    yearsExperience: 8,
    achievements:
      "Led a payments product from zero to 120 enterprise customers and managed a 14-person product team.",
    profileText:
      "Fintech product leader with eight years across lending and payments. Built regulated onboarding systems used by 120 businesses and shipped risk tooling with bank partners.",
  },
  startup: {
    name: "FinPilot",
    website: "https://finpilot.example",
    oneLinePitch:
      "FinPilot gives Indian exporters a live cash-flow control tower built from bank and invoice data.",
    problem:
      "Exporters reconcile invoices, receivables, and currency exposure across spreadsheets, causing delayed collections and avoidable working-capital gaps.",
    solution:
      "A finance workspace connects bank feeds and invoices, flags collection risk, and produces weekly cash actions for finance teams.",
    targetCustomer: "Indian export businesses with 20 to 250 employees",
    market:
      "The initial segment is 18,000 digitally active Indian exporters with dedicated finance teams.",
    stage: "Seed",
    traction:
      "Twelve paid pilots completed, nine converted to annual contracts, and 85% of weekly finance reports are opened.",
    revenueOrUsers: "INR 18 lakh ARR from 9 paying customers",
    team:
      "Three full-time engineers, one former export-finance operator, and the founder leading product and sales.",
    fundingAsk: "INR 2 crore pre-seed round",
    useOfFunds:
      "60% product and bank integrations, 25% exporter acquisition, and 15% security and compliance.",
  },
};

export const weakIntake: GrillIntake = {
  founder: {
    fullName: "Sam Founder",
    role: "Founder",
    background: "I like startups and want to build something useful.",
    yearsExperience: 0,
    achievements: "",
    profileText: "Founder building the future.",
  },
  startup: {
    name: "BigIdea",
    website: "",
    oneLinePitch: "An AI platform for everyone.",
    problem: "Everything is inefficient.",
    solution: "We use AI to make it better.",
    targetCustomer: "Everyone",
    market: "Huge global market",
    stage: "Idea",
    traction: "",
    revenueOrUsers: "",
    team: "Just me",
    fundingAsk: "Need funding",
    useOfFunds: "Growth",
  },
};

export const contradictoryIntake: GrillIntake = {
  ...strongIntake,
  startup: {
    ...strongIntake.startup,
    name: "SignalSplit",
    traction: "We are pre-launch with no users, no customers, and no revenue.",
    revenueOrUsers: "500 paying customers and INR 10 lakh MRR",
    oneLinePitch:
      "The world's only revolutionary finance platform with guaranteed 10x growth.",
  },
};

export const parsedDeck: ArtifactResult = {
  kind: "pitch_deck",
  status: "parsed",
  sourceLabel: "finpilot-deck.pdf",
  fileName: "finpilot-deck.pdf",
  mimeType: "application/pdf",
  byteSize: 42_000,
  text:
    "Problem: exporters lose time reconciling invoices. Solution: connected cash-flow control tower. Market: 18,000 Indian exporters. Business model: annual SaaS subscription. Traction: 12 paid pilots and 9 annual contracts. Competition: spreadsheets and ERP modules; differentiation is exporter-specific collection risk. Team: fintech product and export-finance operators. Fundraise: INR 2 crore. Use of funds: product, distribution, security.",
  pagesParsed: 9,
  totalPages: 9,
  truncated: false,
};

export const parsedProfile: ArtifactResult = {
  kind: "profile_document",
  status: "parsed",
  sourceLabel: "aisha-profile.txt",
  fileName: "aisha-profile.txt",
  mimeType: "text/plain",
  byteSize: 1_200,
  text:
    "Fintech product leader who built regulated onboarding systems used by 120 businesses, led a 14-person team, and launched risk tooling with bank partners.",
  pagesParsed: 0,
  totalPages: null,
  truncated: false,
};

export const notProvidedDeck: ArtifactResult = {
  kind: "pitch_deck",
  status: "not_provided",
  sourceLabel: "No pitch deck",
  fileName: null,
  mimeType: null,
  byteSize: 0,
  text: "",
  pagesParsed: 0,
  totalPages: null,
  truncated: false,
};

export const unavailableDeck: ArtifactResult = {
  kind: "pitch_deck",
  status: "unavailable",
  sourceLabel: "broken-deck.pdf",
  fileName: "broken-deck.pdf",
  mimeType: "application/pdf",
  byteSize: 128,
  text: "",
  pagesParsed: 0,
  totalPages: null,
  truncated: false,
  errorCode: "PDF_PARSE_FAILED",
  errorMessage: "The deck could not be read. Founder-entered information was still analyzed.",
};
