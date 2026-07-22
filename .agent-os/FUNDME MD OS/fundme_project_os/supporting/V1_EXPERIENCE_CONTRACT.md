# V1 Experience Contract

Status: Supporting experience specification. Subordinate to `PRODUCT_GROUND_TRUTH.md`, the approved design handoff, and the active phase contract.

## One complete user outcome

A founder can describe the startup with minimal effort, provide supporting evidence, receive a credible funding-readiness assessment, download or share it, and join the optimization early-access loop.

## Entry

Required first input:

- founder name
- startup name or website
- one short description only when the website is absent

Optional immediately:

- pitch-deck PDF
- resume/founder profile
- LinkedIn text
- notes
- voice conversation

## Interaction model

The core interaction is one mentor conversation with multiple modalities:

- type
- speak
- upload
- paste URL
- confirm or correct extracted facts

Voice is a modality, not a separate workflow.

## Question-selection rule

Ask only when the answer:

- cannot be extracted safely
- materially changes a score or finding
- resolves a contradiction
- clarifies stage, traction, founder-market fit or funding intent
- improves confidence enough to matter

Never show a long generic questionnaire.

## Conversation state machine

```text
NEW
→ COLLECTING_MINIMUM
→ ACCEPTING_ARTIFACTS
→ LISTENING_OR_TYPING
→ TRANSCRIBING
→ EXTRACTING
→ PROPOSING_EVIDENCE
→ CONFIRMING
→ ASKING_NEXT_BEST_QUESTION
→ READY_TO_ASSESS
→ ASSESSING
→ PARTIAL_RESULT or COMPLETE
→ SHARE_OR_EARLY_ACCESS
```

Recoverable states:

- microphone denied
- transcription failed
- upload rejected
- parsing partial
- parsing failed
- conversation interrupted
- assessment failed
- report partially available

Every voice action must have a typed fallback.

## Processing communication

Only display stages tied to actual system state:

- structuring founder and startup evidence
- reading submitted material
- checking contradictions
- identifying missing proof
- evaluating the funding narrative
- assessing founder-market fit
- preparing recommendations

Do not fabricate website-specific or deck-specific observations before extraction.

## Report hierarchy

1. Verdict
2. Evidence coverage and confidence
3. Strongest and weakest dimensions
4. Dimension breakdown
5. The Grill
6. Founder/profile review
7. Pitch-deck review
8. Highest-leverage actions
9. Download/share
10. Optimization early access

## Free/locked matrix

| Capability | Free V1 | Early access | Future paid |
|---|---:|---:|---:|
| Funding Readiness Score | Yes | Yes | Yes |
| Dimension scores | Yes | Yes | Yes |
| Top red flags | Yes | Yes | Yes |
| Contradictions | Yes | Yes | Yes |
| Missing evidence | Yes | Yes | Yes |
| Top actions | Yes | Yes | Yes |
| Download/share | Yes | Yes | Yes |
| Referral priority | No | Yes | Replaced by entitlement |
| Full founder rewrite | Preview only | Waitlist | Yes |
| Full startup rewrite | Preview only | Waitlist | Yes |
| LinkedIn rewrite | Preview only | Waitlist | Yes |
| Deck storyline rewrite | Preview only | Waitlist | Yes |
| Personalized matches | Preview later | Limited later | Subscription |
| Application drafting | No | No | Later plan |

## Referral rule

Only a verified referred signup changes priority.

Do not:

- show fake queue numbers
- count raw clicks
- expose private report evidence
- create public report links by default
- imply payment or entitlement

## Acceptance criteria

- Initial interaction does not feel like a form.
- Voice and text can be switched without losing context.
- Founder can continue when deck parsing fails.
- No claim lacks evidence or an explicit missing-evidence state.
- Same input and rubric version return the same score.
- Mobile flow is complete.
- Report is useful before early-access signup.
- Production is unchanged until release approval.
