## 2024-12-05 - Inconsistent Keyboard Focus & ARIA Labels in Custom Modals
**Learning:** Icon-only close buttons (like `<X>`) and custom tab groups often miss critical accessibility attributes (`aria-label`) and keyboard focus states (`focus-visible`) when developers bypass standard design system components (e.g., using a raw `<button>` instead of `<Button variant="ghost">`).
**Action:** Always verify that custom buttons, especially those using icons exclusively, have an explicit `aria-label` and include `focus-visible:outline-none focus-visible:ring-2` to support keyboard navigation.
