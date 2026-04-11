# Roast Feature Design

**Date:** 2026-04-11  
**Status:** Approved  

---

## Summary

Add a brutal AI roast of the founder's pitch deck as the final step of the onboarding flow. After completing onboarding, users land on a `/roast` page where GROQ generates a savage, no-mercy critique of their startup. A "Fix my deck" CTA closes the loop and sends them to the existing `/thank-you` page.

Also extends Step 1 of onboarding to collect website URL, LinkedIn URL, and X (Twitter) URL as separate optional fields — giving the roast more surface area to attack.

---

## Flow (After)

```
Step 1: Founder Profile (name, role, company, website URL, LinkedIn URL, X URL)
Step 2: Voice Pitch
Step 3: Document Upload
Step 4: Review & Confirm
Step 5: Processing animation → redirect to /roast
/roast: GROQ generates brutal roast → "Fix my deck" CTA
/thank-you: existing page, no changes
```

---

## Data & State

### New fields in `OnboardingDraft` (localStorage)

```ts
websiteUrl?: string
linkedInUrl?: string
xUrl?: string
```

Stored under the existing `ONBOARDING_DRAFT_KEY`. No changes to `DemoProvider`.

### Supabase — SQL to run

```sql
ALTER TABLE onboarding_submissions
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS x_url TEXT;
```

The existing `linkedin_url` column maps to `linkedInUrl`. Only `website_url` and `x_url` are new.

---

## Files Changed

### 1. `app/onboarding/page.tsx`

- Extend `OnboardingDraft` type with `websiteUrl`, `linkedInUrl`, `xUrl`
- Add 3 new optional fields to Step 1 grid (after company name):
  - Website URL — placeholder `https://totem.io`
  - LinkedIn URL — placeholder `https://linkedin.com/in/...`
  - X (Twitter) URL — placeholder `https://x.com/...`
- Hydrate new fields from localStorage on mount
- Persist new fields to localStorage on change
- Pass new fields to `finishOnboarding` POST body
- Change step 5 redirect: `router.push("/thank-you")` → `router.push("/roast")`
- Change `handleSkipToDemo` redirect to also go to `/roast`

### 2. `app/api/onboarding/route.ts`

- Accept `websiteUrl` and `xUrl` from POST body
- Add `website_url` and `x_url` to Supabase upsert
- `linkedin_url` already exists, now maps to `linkedInUrl` from body (rename key in body from `linkedIn` to `linkedInUrl` — or keep backward compat by accepting both)

### 3. `app/roast/page.tsx` _(new)_

- On mount: reads `ONBOARDING_DRAFT_KEY` from localStorage
- Fires `POST /api/roast` with `{ name, companyName, notes, websiteUrl, linkedInUrl, xUrl, files }`
- Loading state: spinner pill (brand orange) + copy `"Sharpening the knives..."`
- Success state:
  - Badge: `"YOUR DECK, DESTROYED"` in brand orange pill
  - Large heading: `"We read everything. Here's the truth."`  
  - Roast text in a styled card (readable, scrollable)
  - Sticky bottom bar: `"Fix my deck →"` button (brand orange, `router.push("/thank-you")`)
- Error state: graceful fallback message, still shows CTA
- Visual style: white background, same font/spacing as onboarding — savagery is in the copy, not the UI

### 4. `app/api/roast/route.ts` _(new)_

- `POST` handler
- Reads `name`, `companyName`, `notes`, `websiteUrl`, `linkedInUrl`, `xUrl`, `files` from body
- Calls GROQ REST API via `fetch` using `GROQ_API_KEY` from `process.env`
- Model: `llama-3.3-70b-versatile`
- Not streamed — awaits full completion, returns `{ roast: string }`
- System prompt persona: brutally savage investor, zero tolerance for startup clichés, specific burns, no encouragement, no softening

**Prompt structure:**
```
System: You are a brutally savage partner at a top-tier VC fund. 
You have seen 10,000 pitch decks. You have zero patience for vague language, 
buzzwords, or wishful thinking. Your job is to roast this founder's pitch 
with surgical precision and no mercy. Be specific. Be devastating. Be funny. 
Do not offer encouragement. Do not soften the blows. Do not end on a positive note.

User: Here is the founder's information:
- Name: {name}
- Company: {companyName}
- Website: {websiteUrl}
- LinkedIn: {linkedInUrl}
- X: {xUrl}
- Uploaded materials: {files.join(", ")}
- Their pitch in their own words: {notes}

Roast them. End with a one-line killer summary verdict.
```

---

## Constraints

- No changes to `demo-provider.tsx`
- No changes to `thank-you/page.tsx`
- No changes to `lib/demo-data.ts`
- No new npm packages — GROQ called via native `fetch`
- All new UI matches existing onboarding aesthetic (white bg, `#ff6b3d` brand orange, same typography)
- Website URL, LinkedIn URL, X URL are all optional — roast works even if fields are empty
