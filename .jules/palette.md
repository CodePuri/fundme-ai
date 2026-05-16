## 2024-05-16 - [Missing ARIA Label on Dynamic List Items]
**Learning:** Dynamically created icon-only buttons in lists (like file uploads) often miss aria-labels. Screen readers would just read "button" without context of what file is being removed.
**Action:** When mapping over items to create lists with action buttons, always ensure the action button has an `aria-label` that includes the specific item's name (e.g., `aria-label={\`Remove \${file}\`}`).
