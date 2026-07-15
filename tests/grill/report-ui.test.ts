import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import * as ResultModule from "../../app/grill/result/result-client";

test("the report renders generated profile credibility gaps", () => {
  const component = (
    ResultModule as unknown as Record<string, ComponentType<{ findings: string[] }>>
  ).ProfileCredibilityGaps;

  assert.equal(typeof component, "function");
  const markup = renderToStaticMarkup(
    createElement(component, {
      findings: ["The profile lacks a quantified outcome or scale signal."],
    }),
  );
  assert.match(markup, /Credibility gaps/);
  assert.match(markup, /lacks a quantified outcome/);
});
