
## 2024-10-24 - Missing noopener on external links
**Vulnerability:** External links (`target="_blank"`) missing `rel="noopener"`.
**Learning:** This exposes the application to "reverse tabnabbing", a phishing technique where the newly opened tab can change the `window.opener.location` of the original page to a malicious site.
**Prevention:** Always add `rel="noopener noreferrer"` to external links.
