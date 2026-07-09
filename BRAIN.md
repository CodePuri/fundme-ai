# Project Brain & Knowledge Base

This document serves as the shared project memory for all contributors and AI agents. It tracks architectural decisions, constraints, patterns, and critical bug resolutions. 
Agents: Continuously read and update this document at the end of substantial tasks. Do not duplicate information; update existing entries.

## 1. Architectural Decisions & Rationale
- **Next.js & Framer Motion:** The site heavily utilizes Framer Motion for scroll-based `SectionReveal` animations. 

## 2. Critical Bugs & Root Causes
- **SEV-0 Blank UI (July 2026):** Users with `prefers-reduced-motion` enabled in their OS saw a completely blank beige page below the header.
  - **Root Cause:** A hydration mismatch. The `useSafeReducedMotion()` hook returned `false` on the server (SSR), baking `opacity: 0` into the initial HTML. On the client, it evaluated to `true`, which dynamically stripped the `whileInView` prop. Framer Motion crashed/skipped the transition, leaving the elements permanently at `opacity: 0`.
  - **Fix:** We disabled the hook from stripping animation props dynamically. We must use `duration: 0` transitions or `<MotionConfig reducedMotion="user">` for accessibility, rather than conditionally unmounting the animation props themselves.

## 3. Coding Conventions & Best Practices
- Prevent hydration bugs by ensuring SSR and initial Client render match perfectly.
- Avoid using `window` or OS media queries to dynamically alter the structural props of Framer Motion components (like `initial`, `animate`, `whileInView`) during the first hydration pass.
