## 2024-05-24 - Make onboarding edit buttons keyboard accessible
**Learning:** Raw SVG icons used as interactive elements without a `<button>` wrapper (e.g., `<PenIcon onClick={...} />`) are a recurring accessibility anti-pattern in the codebase that prevents keyboard navigation and screen reader access.
**Action:** Always wrap interactive icon-only elements in a `<button>` with `type="button"`, an appropriate `aria-label`, and visible focus styles (e.g., `focus-visible:ring-2`) for keyboard accessibility.
