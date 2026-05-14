# FUNDME EARLY ACCESS LIVE READY PROTOCOL

## 1. Current Branch
`feature/early-access-intake-preview`

## 2. Current Commit
4a975f7

## 3. Current Preview URL
https://fundme-2w7kbg1ol-aakash-s-projects-bf7b5a5e.vercel.app

## 4. Product Intent
Make the existing Fundme Early Access onboarding flow genuinely live-ready for preview review before any domain connection. Focus is strictly on gathering founder profile and startup idea for an early access waitlist, not performing real-time diagnosis or deck roasts.

## 5. Required User Journey
1. `/onboarding`
2. **Founder Profile**: Gather name, role, company, email, social links.
3. **Startup Idea**: Voice or text input of what the founder is building.
4. **Documents** (optional): Upload pitch deck or other materials.
5. **Review**: Confirm details.
6. **Submit for assessment**: Submit data.
7. **Supabase save**: Persist data securely.
8. **Loader**: Minimum 5-second dynamic loader to create illusion of labor.
9. `/thank-you`: Confirmation page.

## 6. Field Requirements
- Step 1: `Name` and `Company Name` are required. EITHER `Email` OR `LinkedIn URL` is required.
- Step 2: `Notes` (startup idea) must be between 35 and 250 words.
- Step 3: Documents are optional.

## 7. Voice Recognition Lifecycle Rules
- Must use `isManualStopRef` to differentiate system audio drops from explicit user termination.
- "Captured!" state must ONLY be shown if useful transcript text actually exists.
- If user taps mic, says nothing, and stops, it must return to "idle" and show "We couldn't capture your voice clearly. Please try again or type your idea instead."
- Typed text must be preserved.
- Auto-restart must use a live reference to notes to avoid stale closures (duplicating or wiping text).
- 2-minute hard ceiling for recording.

## 8. Startup Pitch Validation Rules
- Enforced 35 word minimum, 250 word maximum.
- Dynamic messaging indicating words remaining or words over limit.
- Continue button disabled if out of range.

## 9. Supabase Persistence Contract
- API must insert or upsert row to `onboarding_submissions`.
- Must NOT fake success. If Supabase fails, API returns non-2xx status and `error` message.
- API must return `submissionId` or equivalent proof upon successful save.
- **Service Role Key must be provided via environment variable (`SUPABASE_SERVICE_ROLE_KEY`). Hardcoded fallbacks are strictly prohibited.**

## 10. Loader Behavior
- Loader appears immediately after successful submission.
- Remains visible for a minimum of 5 seconds.
- Displays dynamic messages specific to "early funding assessment" using the startup's name and idea context.

## 11. Thank-You Page Copy
- Headline: "Thanks, [FirstName]. You’re on the list."
- Body copy confirms receipt and sets expectation for an email from Team Totem.
- Must NOT contain any roast language.

## 12. Mobile Acceptance Criteria
- 390px viewport optimized.
- Compact header and padding.
- No horizontal overflow.
- CTAs fully visible and reachable, not hidden by browser chrome.
- No floating global "Skip" button.

## 13. Forbidden Copy
The active onboarding and thank-you paths MUST NOT contain:
- `Submit for early access`
- `Submit for fixes`
- `Fix my deck`
- `Your deck, destroyed`
- `deck destroyed`
- `We read everything`
- `Here’s the truth`
- `roast`
- `mercy`
- `couldn’t complete`
- `analysis complete`
- `score ready`

## 14. Browser QA Checklist
- [x] Desktop: Happy path completion with 35+ words.
- [x] Mobile (390px): Layout scaling, button reachability.
- [ ] Voice: Microphone permission, live transcription, accurate "Captured!" state.
- [ ] Supabase: Row creation verified via API response.

## 15. Preview Deployment Checklist
- [x] Clean worktree.
- [x] Successful build (`pnpm build`).
- [x] Pushed to `feature/early-access-intake-preview`.
- [x] Deployed to Vercel via `npx vercel --confirm`.

## 16. Domain Cutover Gate
Domain cutover (`tryfundme.in`, production deployment) is blocked until:
1. This preview deployment passes all QA above.
2. `SUPABASE_SERVICE_ROLE_KEY` is securely set in the target environment.
3. Explicit human confirmation that Voice UI passes.

## 17. Rollback Plan
If critical issues arise post-deployment:
1. Revert `app/api/onboarding/route.ts` and `app/onboarding/page.tsx` to commit prior to final readiness pass.
2. Do NOT deploy `main` or alter production aliases until issue is isolated in the `feature` branch.
