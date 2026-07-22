# Supporting Engineering Memory

Status: Supporting incident and implementation memory. It is not product, deployment, design, or architecture truth.

The canonical authority order and active project state live in [CANONICAL_SOURCE_MAP.md](./.agent-os/FUNDME%20MD%20OS/fundme_project_os/CANONICAL_SOURCE_MAP.md) and [PROJECT_STATE.md](./.agent-os/FUNDME%20MD%20OS/fundme_project_os/PROJECT_STATE.md). Keep this file limited to reusable engineering lessons that do not duplicate or override those documents.

## 1. Architectural Decisions & Rationale
- **Next.js & Framer Motion:** The site heavily utilizes Framer Motion for scroll-based `SectionReveal` animations.

## 2. Critical Bugs & Root Causes
- **SEV-0 Blank UI (July 2026):** Users with `prefers-reduced-motion` enabled in their OS saw a completely blank beige page below the header.
  - **Root Cause:** A hydration mismatch. The `useSafeReducedMotion()` hook returned `false` on the server (SSR), baking `opacity: 0` into the initial HTML. On the client, it evaluated to `true`, which dynamically stripped the `whileInView` prop. Framer Motion crashed/skipped the transition, leaving the elements permanently at `opacity: 0`.
  - **Fix:** We disabled the hook from stripping animation props dynamically. We must use `duration: 0` transitions or `<MotionConfig reducedMotion="user">` for accessibility, rather than conditionally unmounting the animation props themselves.

## 3. Coding Conventions & Best Practices
- Prevent hydration bugs by ensuring SSR and initial Client render match perfectly.
- Avoid using `window` or OS media queries to dynamically alter the structural props of Framer Motion components (like `initial`, `animate`, `whileInView`) during the first hydration pass.
