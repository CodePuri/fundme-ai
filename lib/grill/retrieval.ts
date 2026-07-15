import type {
  GrillDossier,
  KnowledgeCorpusItem,
  RetrievedGuidance,
} from "./types";
import type { KnowledgeRetriever } from "./contracts";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function tokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 2 && !STOP_WORDS.has(token)) ?? [],
  );
}

function dossierQuery(dossier: GrillDossier) {
  return [
    ...dossier.evidence.map((item) => `${item.category} ${item.sourceLabel} ${item.text}`),
    ...dossier.missingInformation.map((item) => `${item.label} ${item.reason}`),
  ].join(" ");
}

export class LocalKnowledgeRetriever implements KnowledgeRetriever {
  constructor(private readonly corpus: KnowledgeCorpusItem[]) {}

  retrieve(dossier: GrillDossier, limit = 5): RetrievedGuidance[] {
    const queryTokens = tokens(dossierQuery(dossier));
    const ranked = this.corpus.map((item) => {
      const tagMatches = item.tags.filter((tag) => queryTokens.has(tag.toLowerCase()));
      const itemTokens = tokens(`${item.title} ${item.category} ${item.guidance}`);
      const textMatches = [...itemTokens].filter((token) => queryTokens.has(token));
      const matchedTerms = [...new Set([...tagMatches, ...textMatches])].sort();
      return {
        ...item,
        score: tagMatches.length * 4 + textMatches.length,
        matchedTerms,
      };
    });

    return ranked
      .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
      .slice(0, Math.max(0, Math.min(limit, this.corpus.length)));
  }
}
