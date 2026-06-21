# Development Guidelines

## Tools & Formatting
- **Package Manager**: pnpm (v10.12+)
- **Linting**: ESLint and Next.js recommended rules (`eslint.config.mjs`).
- **CSS**: Tailwind CSS via PostCSS.

## Workflows
1. Never commit to `main` without testing in a preview deployment first.
2. For database migrations, add the `.sql` scripts to `infrastructure/db-scripts/` and run them against the Supabase staging project before production.

## Review Process
- Code reviews must verify:
  1. Spec compliance.
  2. Prevention of drift (no out-of-scope additions).
  3. Security (proper RLS and backend handling).
  4. Adherence to Agent Rules (no legacy "roast" copy).
