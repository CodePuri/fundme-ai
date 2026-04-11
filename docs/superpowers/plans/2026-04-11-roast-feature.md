# Roast Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add website URL, LinkedIn URL, and X URL fields to onboarding Step 1, then route users to a new `/roast` page after onboarding where GROQ generates a brutal savage AI critique of their pitch, followed by a "Fix my deck" CTA to `/thank-you`.

**Architecture:** Extend the existing `OnboardingDraft` localStorage shape with 3 new optional fields. After the processing step, redirect to `/roast` instead of `/thank-you`. The `/roast` page reads from localStorage on mount, calls a new `/api/roast` route which proxies to GROQ, and renders the result. No changes to `demo-provider.tsx`, `thank-you/page.tsx`, or `lib/demo-data.ts`.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind v4, Framer Motion, GROQ REST API (via native `fetch`, no SDK), Supabase (existing), Clerk (existing).

> **No test runner is configured in this project.** All verification steps are manual — run `pnpm dev` and verify in the browser at `http://localhost:3000`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/onboarding/page.tsx` | Modify | Add 3 new fields to Step 1, extend draft type/hydration/persistence, change processing redirect |
| `app/api/onboarding/route.ts` | Modify | Accept and persist `websiteUrl` + `xUrl` to Supabase |
| `app/api/roast/route.ts` | Create | Proxy to GROQ, return `{ roast: string }` |
| `app/roast/page.tsx` | Create | Loading state, render roast, "Fix my deck" CTA |

---

## Task 1: Extend Onboarding Step 1 with 3 new fields + change redirect

**Files:**
- Modify: `app/onboarding/page.tsx`

### Step 1.1 — Extend the `OnboardingDraft` type

In `app/onboarding/page.tsx`, find the `OnboardingDraft` type (line 26) and add `websiteUrl` and `xUrl`:

```ts
type OnboardingDraft = {
  step?: number;
  name?: string;
  role?: string;
  companyName?: string;
  linkedIn?: string;
  websiteUrl?: string;
  xUrl?: string;
  notes?: string;
  files?: string[];
  imported?: boolean;
};
```

### Step 1.2 — Add state variables for new fields

After the `const [linkedIn, setLinkedIn] = useState("");` line (line 49), add:

```ts
const [websiteUrl, setWebsiteUrl] = useState("");
const [xUrl, setXUrl] = useState("");
```

### Step 1.3 — Hydrate new fields from localStorage

In the hydration `useEffect` (starting line 73), add two new local variables alongside the others at the top of the effect:

```ts
let nextWebsiteUrl = "";
let nextXUrl = "";
```

Then in the `if (savedDraft)` block, after `if (parsed.linkedIn) nextLinkedIn = parsed.linkedIn;` (line 97), add:

```ts
if (parsed.websiteUrl) nextWebsiteUrl = parsed.websiteUrl;
if (parsed.xUrl) nextXUrl = parsed.xUrl;
```

Then inside `startTransition`, after `setLinkedIn(nextLinkedIn);` (line 116), add:

```ts
setWebsiteUrl(nextWebsiteUrl);
setXUrl(nextXUrl);
```

### Step 1.4 — Persist new fields to localStorage

Replace the persistence `useEffect` body (lines 135–150) with:

```ts
useEffect(() => {
  if (!hasHydrated) return;

  window.localStorage.setItem(
    ONBOARDING_DRAFT_KEY,
    JSON.stringify({
      name,
      role,
      companyName,
      linkedIn,
      websiteUrl,
      xUrl,
      notes,
      files,
      imported: hasImported
    })
  );
}, [hasHydrated, name, role, companyName, linkedIn, websiteUrl, xUrl, notes, files, hasImported]);
```

### Step 1.5 — Add 3 new fields to the Step 1 grid UI

In the Step 1 JSX, find the Company Name `<Field>` block (the one with `md:col-span-2` and placeholder `"e.g. Totem Interactive"`). After its closing `</Field>` tag and before the `<div className="flex justify-end ...">` footer div, insert:

```tsx
<Field className="md:col-span-2">
  <FieldLabel className="text-[13px] font-bold text-black uppercase tracking-wider mb-2.5">Website URL</FieldLabel>
  <Input
    className="h-12 rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[16px]"
    placeholder="https://totem.io"
    onChange={(e) => setWebsiteUrl(e.target.value)}
    value={websiteUrl}
  />
</Field>
<Field>
  <FieldLabel className="text-[13px] font-bold text-black uppercase tracking-wider mb-2.5">LinkedIn URL</FieldLabel>
  <Input
    className="h-12 rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[16px]"
    placeholder="https://linkedin.com/in/..."
    onChange={(e) => setLinkedIn(e.target.value)}
    value={linkedIn}
  />
</Field>
<Field>
  <FieldLabel className="text-[13px] font-bold text-black uppercase tracking-wider mb-2.5">X (Twitter) URL</FieldLabel>
  <Input
    className="h-12 rounded-[12px] bg-black/[0.02] border-black/5 focus:bg-white transition-all text-[16px]"
    placeholder="https://x.com/..."
    onChange={(e) => setXUrl(e.target.value)}
    value={xUrl}
  />
</Field>
```

### Step 1.6 — Pass new fields to `finishOnboarding` POST body

In `finishOnboarding` (around line 212), find the `fetch("/api/onboarding", ...)` call. Replace the `body: JSON.stringify({...})` object with:

```ts
body: JSON.stringify({
  name: resolvedName,
  role: resolvedRole,
  companyName: resolvedCompany,
  linkedIn: resolvedLinkedIn,
  notes: resolvedNotes,
  websiteUrl,
  xUrl,
}),
```

### Step 1.7 — Change the processing redirect from `/thank-you` to `/roast`

Find this line inside the step 5 `useEffect` (around line 177):

```ts
router.push("/thank-you");
```

Change it to:

```ts
router.push("/roast");
```

### Step 1.8 — Verify in browser

Run:
```bash
cd fundme-ai && pnpm dev
```

Navigate to `http://localhost:3000/onboarding`. Confirm:
- Step 1 shows 3 new optional fields: Website URL, LinkedIn URL, X (Twitter) URL
- Filling them in and going back (step 2 → step 1) preserves the values
- The Continue button on Step 1 still requires only Name and Company (new fields are optional)

### Step 1.9 — Commit

```bash
git add app/onboarding/page.tsx
git commit -m "feat: add website, linkedin, x url fields to onboarding step 1 and redirect to /roast"
```

---

## Task 2: Update onboarding API route to persist new fields

**Files:**
- Modify: `app/api/onboarding/route.ts`

### Step 2.1 — Extend the POST body type

Find the `const body = await req.json() as { ... }` block (around line 34 of the route file). Replace it with:

```ts
const body = await req.json() as {
  name?: string;
  role?: string;
  companyName?: string;
  linkedIn?: string;
  websiteUrl?: string;
  xUrl?: string;
  notes?: string;
};
```

### Step 2.2 — Add new columns to the Supabase upsert

Find the `supabase.from("onboarding_submissions").upsert(...)` call. Replace the upsert object with:

```ts
{
  clerk_user_id: userId,
  email,
  name: body.name ?? null,
  role: body.role ?? null,
  company_name: body.companyName ?? null,
  linkedin_url: body.linkedIn ?? null,
  website_url: body.websiteUrl ?? null,
  x_url: body.xUrl ?? null,
  notes: body.notes ?? null,
},
```

> **Note:** `website_url` and `x_url` columns must exist in Supabase before this runs. SQL to execute in the Supabase dashboard:
> ```sql
> ALTER TABLE onboarding_submissions
>   ADD COLUMN IF NOT EXISTS website_url TEXT,
>   ADD COLUMN IF NOT EXISTS x_url TEXT;
> ```

### Step 2.3 — Commit

```bash
git add app/api/onboarding/route.ts
git commit -m "feat: persist website_url and x_url to supabase onboarding_submissions"
```

---

## Task 3: Create `/api/roast` GROQ proxy route

**Files:**
- Create: `app/api/roast/route.ts`

### Step 3.1 — Create the route file

Create `app/api/roast/route.ts` with the following content:

```ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json() as {
    name?: string;
    companyName?: string;
    notes?: string;
    websiteUrl?: string;
    linkedInUrl?: string;
    xUrl?: string;
    files?: string[];
  };

  const {
    name,
    companyName,
    notes,
    websiteUrl,
    linkedInUrl,
    xUrl,
    files = [],
  } = body;

  const systemPrompt = `You are a brutally savage partner at a top-tier VC fund who has reviewed over 10,000 pitch decks. You have zero tolerance for vague startup language, buzzwords, wishful thinking, or generic market sizing. Your job is to roast this founder's pitch with surgical precision and absolutely no mercy. Be devastatingly specific about their weaknesses. Be funny. Be brutal. Do not offer encouragement. Do not soften any blows. Do not end on a positive note. Do not say anything like "but here's how you could improve." This is a roast, not a coaching session.`;

  const userPrompt = `Here is everything I know about this founder and their startup:

Name: ${name || "Not provided"}
Company: ${companyName || "Not provided"}
Website: ${websiteUrl || "Not provided"}
LinkedIn: ${linkedInUrl || "Not provided"}
X (Twitter): ${xUrl || "Not provided"}
Uploaded materials: ${files.length > 0 ? files.join(", ") : "None uploaded"}

Their pitch in their own words:
${notes || "They didn't even bother writing a pitch."}

Roast them end to end. Cover their founder story, their pitch, their business model, their market positioning, and anything else you can find to destroy. End with a one-line killer verdict.`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 1200,
      }),
    });

    if (!groqRes.ok) {
      return NextResponse.json({ error: "GROQ request failed" }, { status: 500 });
    }

    const data = await groqRes.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const roast = data.choices[0]?.message?.content ?? "We couldn't complete the roast right now. Consider that a brief mercy — it won't last.";

    return NextResponse.json({ roast });
  } catch {
    return NextResponse.json(
      { roast: "We couldn't complete the roast right now. Consider that a brief mercy — it won't last." },
      { status: 200 }
    );
  }
}
```

### Step 3.2 — Verify GROQ_API_KEY is set

Check `.env.local` (or equivalent) for `GROQ_API_KEY`. If missing, add it:

```
GROQ_API_KEY=your_groq_api_key_here
```

### Step 3.3 — Verify the route responds

With `pnpm dev` running, test the route:

```bash
curl -X POST http://localhost:3000/api/roast \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Founder","companyName":"Test Co","notes":"We are building an AI platform for everything."}'
```

Expected: JSON response with a `roast` string field containing brutal critique text.

### Step 3.4 — Commit

```bash
git add app/api/roast/route.ts
git commit -m "feat: add /api/roast GROQ proxy route"
```

---

## Task 4: Create `/roast` page

**Files:**
- Create: `app/roast/page.tsx`

### Step 4.1 — Create the page

Create `app/roast/page.tsx` with the following content:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, LoaderCircle } from "lucide-react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { Button } from "@/components/ui/button";
import { ONBOARDING_DRAFT_KEY } from "@/components/app/demo-provider";

type DraftData = {
  name?: string;
  companyName?: string;
  notes?: string;
  linkedIn?: string;
  websiteUrl?: string;
  xUrl?: string;
  files?: string[];
};

export default function RoastPage() {
  const router = useRouter();
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    let draft: DraftData = {};
    if (raw) {
      try {
        draft = JSON.parse(raw) as DraftData;
      } catch {
        // ignore malformed draft
      }
    }

    fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        companyName: draft.companyName,
        notes: draft.notes,
        linkedInUrl: draft.linkedIn,
        websiteUrl: draft.websiteUrl,
        xUrl: draft.xUrl,
        files: draft.files ?? [],
      }),
    })
      .then((res) => res.json())
      .then((data: { roast?: string }) => {
        setRoast(data.roast ?? "We couldn't complete the roast right now. Consider that a brief mercy — it won't last.");
        setLoading(false);
      })
      .catch(() => {
        setRoast("We couldn't complete the roast right now. Consider that a brief mercy — it won't last.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="mb-10">
          <BrandLockup />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 text-[#ff6b3d] text-[12px] font-bold uppercase tracking-wider">
            <LoaderCircle className="size-3 animate-spin" /> Sharpening the knives...
          </div>
          <p className="text-[15px] text-black/30 max-w-[280px] text-center">
            Our AI is reading everything you submitted. Brace yourself.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Top brand */}
      <div className="flex items-center justify-center pt-10 pb-6 px-6">
        <BrandLockup />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[680px] flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff5f0] border border-[#ff6b3d]/10 text-[#ff6b3d] text-[12px] font-bold uppercase tracking-wider mb-6"
          >
            <Flame className="size-3" /> Your deck, destroyed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-[40px] sm:text-[48px] font-semibold tracking-[-0.04em] leading-[1.1] text-black mb-10"
          >
            We read everything.<br />Here&apos;s the truth.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full text-left rounded-[24px] border border-black/[0.08] bg-black/[0.015] p-8 sm:p-10"
          >
            <p className="text-[16px] sm:text-[17px] text-black leading-[1.75] whitespace-pre-wrap">
              {roast}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-black/5 px-6 py-5 flex justify-center">
        <Button
          onClick={() => router.push("/thank-you")}
          size="lg"
          className="h-14 px-12 rounded-full text-[16px] font-bold bg-[#ff6b3d] border-[#ff6b3d] text-white shadow-xl shadow-[#ff6b3d]/20 hover:bg-[#e85a2d] hover:border-[#e85a2d]"
        >
          Fix my deck →
        </Button>
      </div>
    </main>
  );
}
```

### Step 4.2 — Verify the full flow in browser

With `pnpm dev` running, go through the complete flow:

1. `http://localhost:3000/onboarding` — complete all 4 steps
2. Fill in Website URL, LinkedIn URL, X URL in Step 1 (optional — can leave blank)
3. Complete voice/pitch step, upload step (can skip), review step
4. Click "Confirm and Submit"
5. Processing animation runs (~5s)
6. **Confirm redirect lands on `/roast`** not `/thank-you`
7. Loading state shows: "Sharpening the knives..." pill with spinner
8. After GROQ responds: brutal roast renders in the card
9. "Fix my deck →" button at bottom navigates to `/thank-you`
10. Thank-you page renders as before, no changes

### Step 4.3 — Commit

```bash
git add app/roast/page.tsx
git commit -m "feat: add /roast page with GROQ-powered brutal pitch critique and fix my deck CTA"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** websiteUrl ✓, linkedInUrl ✓, xUrl ✓, /roast page ✓, /api/roast ✓, loading state ✓, "Fix my deck" CTA → /thank-you ✓, no changes to demo-provider/thank-you/lib ✓
- [x] **Placeholder scan:** No TBDs, all code blocks complete
- [x] **Type consistency:** `DraftData.linkedIn` maps to `linkedInUrl` in the POST body — explicit in Task 4 Step 4.1. `OnboardingDraft` extension in Task 1.1 matches the hydration additions in 1.3 and persistence in 1.4. GROQ response type `{ choices: Array<{ message: { content: string } }> }` used consistently in Task 3.
- [x] **No test runner note** included at top — manual verification steps provided for each task
- [x] **Supabase SQL** reminder included in Task 2.2
