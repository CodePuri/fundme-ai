## 2026-04-15 - Missing noopener on external links
**Vulnerability:** External links with `target="_blank"` were missing `rel="noopener"`.
**Learning:** This is a common pattern that enables reverse tabnabbing vulnerabilities, allowing the newly opened page to potentially access and control the `window.opener` object, which could be used for phishing. The codebase previously only used `rel="noreferrer"`.
**Prevention:** Always pair `target="_blank"` with `rel="noopener noreferrer"`, especially for external links.
