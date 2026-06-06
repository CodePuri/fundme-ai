## 2025-06-06 - Interactive Div Keyboard Accessibility
**Learning:** Custom interactive elements (like the file drag-and-drop zone) built with `div` tags often lack native keyboard accessibility. They require explicit ARIA roles (`role="button"`), `tabIndex={0}`, keyboard event handlers (`onKeyDown` for Enter/Space), and visible focus states to be fully accessible.
**Action:** When creating custom interactive zones or drag-and-drop areas, always ensure they can be focused and activated via the keyboard, using visible focus styles consistent with the design system.

## 2025-06-06 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like the file removal 'X' icon) are inaccessible to screen readers without an explicit `aria-label`. They also require clear focus states for keyboard navigation.
**Action:** Always add an appropriate `aria-label` and `focus-visible` styles to any button that relies solely on an icon to convey its function.
