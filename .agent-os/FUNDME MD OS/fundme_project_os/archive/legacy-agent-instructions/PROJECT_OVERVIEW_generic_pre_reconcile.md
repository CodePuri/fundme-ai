# Project Overview

Fundme is an application designed to help startup founders. It features a public-facing early-access onboarding flow to gather founder profiles and startup ideas for a waitlist.

## Target Audience
- Startup founders seeking early funding assessment or joining the waitlist.

## Core Features
1. **Founder Profile & Intake Flow**: A seamless 4-step onboarding flow (`/onboarding`).
2. **Pitch Voice/Text Input**: Dynamic text idea boundary checks (35 to 250 words) and voice-transcription integration.
3. **Application Tracking**: A dashboard for authenticated founders (`/app` routes).
4. **Program Directory**: Exploring startup programs (`/startup-programs`).

## Key Workflows
- **Onboarding Submission**: Data is saved to Supabase (`onboarding_submissions` table) upon successful submission. A loader handles UX during submission processing before redirecting to `/thank-you`.
