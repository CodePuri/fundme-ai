export type IngestedFounderProfile = {
  founderName: string;
  founderRole: string;
  linkedInUrl: string | null;
  profileText: string | null;
  resumeFilename: string | null;
  experienceSummary: string;
  detectedSignals: string[];
  extractedYearsOfExperience: number | null;
  previousCompaniesOrRoles: string[];
};

export function ingestFounderProfile(
  name: string,
  role: string,
  profileText: string,
  linkedInUrl?: string | null,
  resumeText?: string | null,
  resumeFilename?: string | null,
): IngestedFounderProfile {
  const cleanName = name.trim();
  const cleanRole = role.trim();
  const cleanLinkedIn = linkedInUrl?.trim() || null;
  const combinedText = [profileText.trim(), resumeText?.trim()].filter(Boolean).join("\n\n");

  const detectedSignals: string[] = [];
  if (/\b(?:ex-|former|previously at|alumni)\s+([A-Z][a-zA-Z0-9]+)/i.test(combinedText)) {
    detectedSignals.push("repeat-or-bigtech-experience");
  }
  if (/\b(?:founded|co-founded|founder|cto|ceo|vp|head of|lead)\b/i.test(combinedText) || /\b(?:founder|cto|ceo|head of)\b/i.test(cleanRole)) {
    detectedSignals.push("leadership-or-founder-history");
  }
  if (/\b(?:phd|master|bachelor|iit|bits|stanford|mit|iim|harvard|oxford|cambridge)\b/i.test(combinedText)) {
    detectedSignals.push("technical-or-academic-background");
  }
  if (/\b(?:patent|research|published|scale|architect|built|shipped)\b/i.test(combinedText)) {
    detectedSignals.push("technical-depth");
  }

  // Extract years of experience
  const yearsMatch = combinedText.match(/\b(\d{1,2})\+?\s*(?:years|yrs)(?:\s+of)?(?:\s+experience)?\b/i);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : null;

  // Extract previous companies / roles mentioned
  const previousCompanies: string[] = [];
  const companyMatches = combinedText.matchAll(/\b(?:at|with|for|from)\s+([A-Z][a-zA-Z0-9&]{2,20})\b/g);
  for (const m of companyMatches) {
    if (!["The", "A", "An", "In", "Our", "We", "My", "This", "That", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].includes(m[1])) {
      if (!previousCompanies.includes(m[1])) previousCompanies.push(m[1]);
    }
  }

  const experienceSummary = combinedText.slice(0, 3000) || (cleanRole ? `Role: ${cleanRole}` : "Operating experience not provided.");

  return {
    founderName: cleanName,
    founderRole: cleanRole,
    linkedInUrl: cleanLinkedIn,
    profileText: profileText.trim() || null,
    resumeFilename: resumeFilename || null,
    experienceSummary,
    detectedSignals,
    extractedYearsOfExperience: years,
    previousCompaniesOrRoles: previousCompanies.slice(0, 5),
  };
}
