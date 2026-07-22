# Active Phase Contract — Phase 1A Design Acceptance

Status: Proposed; not approved
Owner: Aakash Puri + Yasha
Branch: `product/v1-grill`
Worktree: `/Users/totem/Desktop/Projects/Fundme-Product-V1`
Starting SHA: Set from verified branch HEAD at approval
Preview: None

## One user outcome

A founder-facing FundMe V1 flow has one explicitly approved desktop/mobile Figma contract that engineering can implement without inventing layout, interaction, or visual language.

## Scope

- Verify the canonical Figma owner, file, page, frame IDs, prototype, components, variables, and palette.
- Map every required V1 screen and recoverable state to an approved frame or written behavior.
- Record responsive, accessibility, motion, content, and Production-reuse decisions.
- Update the design source and durable decisions only after explicit approval.

## Explicit exclusions

- No application code, UI build, redesign, backend, schema, AI, environment, or deployment work.
- No automatic approval of Sera HTML, screenshots, Figma experiments, Codex V1 UI, or current Production styling.

## Sources to read

- [PROJECT_STATE.md](./PROJECT_STATE.md)
- [PRODUCT_GROUND_TRUTH.md](./PRODUCT_GROUND_TRUTH.md)
- [DESIGN_SOURCE_OF_TRUTH.md](./DESIGN_SOURCE_OF_TRUTH.md)
- [supporting/V1_EXPERIENCE_CONTRACT.md](./supporting/V1_EXPERIENCE_CONTRACT.md)
- [OPERATING_RULES.md](./OPERATING_RULES.md)

## Existing code to reuse

- Current Production only where an acceptance decision explicitly retains behavior.
- Existing design tokens/components only after they are mapped to approved Figma components.

## Files/domains allowed to change

- Canonical design documentation
- Approved Figma file/library
- Design acceptance evidence

## Data contract

- None; this phase creates no runtime data or schema.

## Design contract

- Figma file: **UNKNOWN — required**
- Frame IDs: **UNKNOWN — required**
- Palette: **UNKNOWN — required**
- Mobile: **UNKNOWN — required**
- Edge states: **UNKNOWN — required**

## Tests

- complete screen/state coverage checklist
- desktop and 390px responsive review
- keyboard, focus, contrast, readable errors, and reduced-motion review
- component/token consistency review

## Evidence

- canonical links and frame IDs
- desktop/mobile exports
- component/variable inventory
- completed accessibility and edge-state checklist
- explicit Aakash/Yasha approval record

## Exit gate

- `DESIGN_SOURCE_OF_TRUTH.md` contains concrete links/IDs and every required state is approved with no unresolved customer-facing decision.

## Stop conditions

- Production moved
- source-of-truth conflict
- Figma access/ownership missing
- desktop/mobile or edge-state coverage missing
- accessibility uncertainty
- external authorization required

## Next contract

PHASE_2A_DOSSIER_EVIDENCE_CONVERSATION.md
