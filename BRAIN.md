# Project Brain & Knowledge Base

This document serves as the shared project memory for all contributors and AI agents. It tracks architectural decisions, constraints, patterns, and critical bug resolutions. 
Agents: Continuously read and update this document at the end of substantial tasks. Do not duplicate information; update existing entries.

## 1. Architectural Decisions & Rationale
- **Next.js & Framer Motion:** The site heavily utilizes Framer Motion for scroll-based `SectionReveal` animations. 
- **V1 Grill runtime boundary (July 2026):** `/grill` and `/api/grill` select a provider set through `FUNDME_RUNTIME_MODE`. Local and Vercel Preview default to isolated demo adapters; Production defaults to a fail-closed live mode until Clerk, Supabase, AI, storage, and entitlement adapters are configured.
- **Readiness, not probability:** `fundme-v1-demo-rubric@1` is deterministic and reports evidence-backed funding readiness. It must never be described as a funding probability or investment recommendation.
- **Evidence provenance:** Only founder-entered fields and successfully extracted artifact text can affect Grill findings. Unreadable PDFs remain explicitly unavailable and cannot produce slide-level claims.
- **Demo persistence:** V1 uses a versioned browser-local repository. Uploaded files are parsed in request memory and are not persisted. Production identity or database writes are not permitted from demo adapters.
- **Accepted V1 Preview (July 2026):** The stable branch URL is `https://fundme-ai-git-codex-v1-grill-demo-aakash-s-projects-bf7b5a5e.vercel.app`; accepted code SHA `5722fe8ba21726d7ddc0fb0e41b8f935fbd97dc7`. Four Git-triggered attempts on this one branch alias were required to correct no-key Clerk and automatic route-prefetch defects. Production remained on `10409284c56f2b5dea968b9e4b727d420b96aaeb`.
- **Public Preview provider boundary:** `/`, `/grill`, `/api/grill`, `/search`, and `/explore` can render without Clerk in a no-key Preview. Authenticated application routes retain Clerk. Public assessment destinations route to `/grill`, avoiding hidden prefetch failures to protected onboarding.

## 2. Critical Bugs & Root Causes
- **SEV-0 Blank UI (July 2026):** Users with `prefers-reduced-motion` enabled in their OS saw a completely blank beige page below the header.
  - **Root Cause:** A hydration mismatch. The `useSafeReducedMotion()` hook returned `false` on the server (SSR), baking `opacity: 0` into the initial HTML. On the client, it evaluated to `true`, which dynamically stripped the `whileInView` prop. Framer Motion crashed/skipped the transition, leaving the elements permanently at `opacity: 0`.
  - **Fix:** We disabled the hook from stripping animation props dynamically. We must use `duration: 0` transitions or `<MotionConfig reducedMotion="user">` for accessibility, rather than conditionally unmounting the animation props themselves.
- **Grill restart retained browser-restored fields (July 2026):** Client routing could restore prior form DOM after local Grill state was cleared. Restart now clears the versioned repository and performs a fresh document replacement to `/grill`.
- **Preview public-route prefetch failures (July 2026):** Next.js automatically prefetched linked routes, exposing Clerk initialization failures even when the visible Grill route worked. Route-scoped Clerk boundaries and public assessment destinations now keep the complete public Preview request graph independent of Clerk.

## 3. Coding Conventions & Best Practices
- Prevent hydration bugs by ensuring SSR and initial Client render match perfectly.
- Avoid using `window` or OS media queries to dynamically alter the structural props of Framer Motion components (like `initial`, `animate`, `whileInView`) during the first hydration pass.
