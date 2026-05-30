## 2024-05-30 - Keyboard Accessible Drag & Drop Zones
**Learning:** Custom div-based interactive areas like drag-and-drop file upload zones natively lack keyboard support, which breaks accessibility for users not using a mouse. Adding onClick is insufficient.
**Action:** Always ensure custom interactive divs implement `role="button"`, `tabIndex={0}`, keyboard event handlers (`onKeyDown` for Enter/Space), and visible focus states (`focus-visible` classes) to provide parity with native `<button>` elements.
