# Astryx Adoption Decision

Status: Accepted for the current visual-refinement pass
Date: 2026-07-23
Scope: FundMe assessment, diagnosis, opportunity teaser, Preview dashboard, and save handoff

## Decision

Astryx is a consistency benchmark, not a runtime dependency.

FundMe already uses React 19, Next.js 16, Tailwind CSS 4, semantic CSS variables, and local primitives for buttons, inputs, cards, and dialogs. Astryx is not installed. Adding its React packages, reset, theme CSS, cascade layers, and optional StyleX foundation would introduce a second component and styling system, increase migration risk, and broaden this bounded visual pass.

No Astryx package or primitive is added.

## Patterns adopted locally

- semantic spacing, color, type, radius, and focus tokens
- consistent card anatomy: identity, category, title, reason, metadata, and action
- one clear component state instead of repeated status pills
- compact, keyboard-safe dialog structure
- consistent interactive borders, hover feedback, focus treatment, and 44px minimum controls
- responsive grid-to-stack composition

## Patterns rejected

- Astryx reset or theme imports
- StyleX migration
- parallel button, badge, card, dialog, or layout primitives
- Astryx themes or visual trade dress
- package installation for documentation-only value

## Revisit condition

Reconsider a narrow primitive only if a later phase proves a local accessibility or behavior defect that cannot be fixed coherently in the existing FundMe system. Any adoption requires a separate bundle, cascade, theming, accessibility, and migration review.
