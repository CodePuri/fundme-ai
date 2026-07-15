import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { GrillShell } from "../../components/grill/grill-shell";
import { ReviewEvidence } from "../../components/grill/review-evidence";
import { strongIntake } from "./fixtures";

test("analysis locks step navigation and review edit controls", () => {
  const shell = renderToStaticMarkup(
    createElement(
      GrillShell as React.ComponentType<Record<string, unknown>>,
      {
        currentStep: 3,
        interactionLocked: true,
        onStepSelect: () => undefined,
      },
      createElement("div"),
    ),
  );
  const review = renderToStaticMarkup(
    createElement(ReviewEvidence as React.ComponentType<Record<string, unknown>>, {
      deckFile: null,
      intake: strongIntake,
      interactionLocked: true,
      missing: [],
      onEdit: () => undefined,
      profileFile: null,
    }),
  );

  assert.equal((shell.match(/<button[^>]*disabled=""/g) ?? []).length, 4);
  assert.equal((review.match(/<button[^>]*disabled=""/g) ?? []).length, 3);
});
