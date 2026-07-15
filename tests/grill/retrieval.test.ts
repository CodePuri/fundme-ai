import assert from "node:assert/strict";
import test from "node:test";

import { buildDossier } from "../../lib/grill/evidence";
import { LocalKnowledgeRetriever } from "../../lib/grill/retrieval";
import { grillKnowledgeCorpus } from "../../lib/grill/server/corpus";
import { parsedDeck, strongIntake } from "./fixtures";

test("retrieval is stable, bounded, and returns corpus provenance", () => {
  const dossier = buildDossier(strongIntake, [parsedDeck]);
  const retriever = new LocalKnowledgeRetriever(grillKnowledgeCorpus);
  const first = retriever.retrieve(dossier, 4);
  const second = retriever.retrieve(dossier, 4);

  assert.deepEqual(first, second);
  assert.equal(first.length, 4);
  assert.ok(first.every((item) => item.id && item.title && item.source && item.guidance));
  assert.ok(first.every((item, index) => index === 0 || item.score <= first[index - 1].score));
});

test("traction-rich dossiers retrieve traction guidance", () => {
  const dossier = buildDossier(strongIntake, [parsedDeck]);
  const results = new LocalKnowledgeRetriever(grillKnowledgeCorpus).retrieve(dossier, 6);

  assert.ok(results.some((item) => item.category === "traction"));
});
