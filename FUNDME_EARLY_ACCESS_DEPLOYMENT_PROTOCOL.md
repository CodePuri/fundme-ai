# Fundme.ai Early-Access Intake — Deployment & Domain Cutover Protocol

This protocol outlines the exact surgical steps required to safely transition the isolated early-access intake preview branch (`feature/early-access-intake-preview`) to production preview status, followed by custom domain mapping for `tryfundme.in` (or the chosen custom domain) once approved by the USER.

---

## 1. Pre-Flight Verification & Guidelines
* **Target Branch Isolation:** All onboarding redesign and metadata extraction logic resides strictly within `feature/early-access-intake-preview`.
* **Zero Production Overwrites:** Do **NOT** merge directly to `main` until the staging preview is fully signed off. 
* **Zero Diagnostic Leakage:** Ensure the experimental Founder Diagnosis / Deck Roasting tools are completely detached from the live public onboarding flow.

---

## 2. Onboarding Flow Refinements Implemented
1. **Neutral Founder Placeholders:** Replaced mock entries (e.g., "Aakash Puri", "Totem Interactive") with industry-neutral placeholders (`Priya Sharma`, `Orbit Labs`).
2. **Mandatory Primary Contact Validation:** Implemented explicit validation requiring an Email Address OR a valid LinkedIn Profile URL to progress past Step 1.
3. **Browser Native Speech Recognition:** Integrated dual voice-transcription and text input modes on Step 2 (`webkitSpeechRecognition`), complete with graceful fallbacks and state tracking.
4. **File Metadata Capture:** Equipped Step 3 (`FileUploadArea`) with an `onFilesAdded` callback interface to accurately record upload array metadata (file sizes, mime-types) alongside full voice transcript payloads.
5. **Unauthenticated Access Enabled:** Upgraded `/api/onboarding` endpoints to dynamically support guest lead submissions with serialized JSON payload routing into the `notes` column for bulletproof schema resiliency.
6. **Direct Confirmation Routing:** All successfully submitted intakes redirect straight to the sleek confirmation screen at `/thank-you`, decoupling the user onboarding session from legacy assessment/roast calculations.

---

## 3. Vercel Preview Walkthrough Checklist (USER Review Required)
Before executing domain mapping, review and test the following functionality against the generated Vercel preview URL:
- [ ] **/onboarding entry:** Verify the public intake flow renders seamlessly on both Desktop and Mobile viewports.
- [ ] **Email-only submission:** Enter an Email address without LinkedIn in Step 1 to verify successful forward progression.
- [ ] **LinkedIn-only submission:** Enter a LinkedIn URL without an Email address in Step 1 to verify successful forward progression.
- [ ] **Missing both blocking:** Leave both Email and LinkedIn blank in Step 1 and attempt to proceed; confirm a client-side warning blocks the step.
- [ ] **Text idea input:** Type a startup pitch into the text area in Step 2.
- [ ] **Voice permission/fallback:** Click the microphone button in Step 2; grant browser permissions to test real-time speech transcription, or deny to test the graceful alert fallback.
- [ ] **Deck metadata capture:** Drop a file into Step 3 and confirm extracted metadata (`name`, `size`, `type`) updates the component state.
- [ ] **Review page validation:** Verify all finalized profile, pitch, and metadata fields are displayed beautifully on Step 4.
- [ ] **Submit action:** Click Submit to send the complete JSON payload to the unauthenticated `/api/onboarding` endpoint.
- [ ] **Supabase row creation:** Check the Supabase table `onboarding_submissions` to confirm a record is created with stable guest ID generation and rich metadata stored safely in the `notes` column.
- [ ] **/thank-you redirection:** Verify immediate navigation to `/thank-you` upon completion.
- [ ] **No roast copy verification:** Double-check that no references to "deck roast," "deck destroyed," or legacy founder diagnosis copy appear anywhere along the entire user path.

---

## 4. Manual Vercel Dashboard Migration Steps

When the USER explicitly issues the command to attach the production domain, execute the following instructions via the Vercel management interface:

### Step A: Detaching the Stale Domain
1. Log in to the Vercel Dashboard and open the legacy/stale project team workspace currently holding the binding for `fundme-ai.vercel.app` / custom routes.
2. Navigate to **Settings** → **Domains**.
3. Locate the target domain entry and click **Edit** → **Remove** to unbind it from the stale workspace. Confirm deletion to release the apex and subdomains.

### Step B: Attaching to the Corrected Deployment Candidate
1. Switch your Vercel workspace context to the corrected verified project context serving the active Next.js candidate.
2. Go to **Settings** → **Domains**.
3. Enter `tryfundme.in` (or the USER-specified top-level domain) and click **Add**.
4. Configure the official Nameservers or CNAME records provided by Vercel inside your domain registrar's DNS panel. Wait for status indicators to turn green (Propagation check).

---

## 5. Post-Cutover Verification Matrix
Once DNS routing successfully delegates traffic to the verified project target, execute these strict checks:
- [ ] **SSL Certification:** Ensure Let's Encrypt certificates are automatically provisioned and active.
- [ ] **Linear Intake Progression:** Verify that entering `/onboarding` strictly navigates Step 1 -> Step 2 -> Step 3 -> Step 4 -> `/thank-you` smoothly.
- [ ] **Protected Explore Routes:** Verify that accessing `/explore` or `/app` sub-routes correctly triggers authorization guards or redirects unauthenticated guests back to Clerk sign-in view.
