export type IngestedWebsite = {
  url: string;
  normalizedUrl: string;
  success: boolean;
  title: string | null;
  description: string | null;
  headings: string[];
  cleanText: string;
  productSignals: string[];
  error?: string;
  fetchedAt: string;
};

export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function ingestWebsite(rawUrl: string): Promise<IngestedWebsite> {
  const fetchedAt = new Date().toISOString();
  const normalizedUrl = normalizeUrl(rawUrl);
  if (!normalizedUrl) {
    return {
      url: rawUrl,
      normalizedUrl: "",
      success: false,
      title: null,
      description: null,
      headings: [],
      cleanText: "",
      productSignals: [],
      error: "No website URL provided.",
      fetchedAt,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FundMeBot/1.0 (+https://tryfundme.in; funding-readiness assessment)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        url: rawUrl,
        normalizedUrl,
        success: false,
        title: null,
        description: null,
        headings: [],
        cleanText: "",
        productSignals: [],
        error: `Website returned HTTP ${response.status}`,
        fetchedAt,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return {
        url: rawUrl,
        normalizedUrl,
        success: false,
        title: null,
        description: null,
        headings: [],
        cleanText: "",
        productSignals: [],
        error: `Unsupported content type: ${contentType}`,
        fetchedAt,
      };
    }

    const html = await response.text();
    const truncatedHtml = html.slice(0, 1_000_000);

    // Extract title
    const titleMatch = truncatedHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = truncatedHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      || truncatedHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    const title = (ogTitleMatch?.[1] || titleMatch?.[1] || "").trim() || null;

    // Extract meta description
    const descMatch = truncatedHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || truncatedHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const ogDescMatch = truncatedHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || truncatedHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
    const description = (descMatch?.[1] || ogDescMatch?.[1] || "").trim() || null;

    // Extract headings
    const headingMatches = [...truncatedHtml.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi)];
    const headings = headingMatches
      .map((m) => stripHtml(m[1]))
      .filter((h) => h.length > 3 && h.length < 120)
      .slice(0, 10);

    // Clean text snippet
    const cleanText = stripHtml(truncatedHtml).slice(0, 5000);

    // Detect product/traction signals in text
    const productSignals: string[] = [];
    if (/pricing|tier|per month|\$|₹|\/mo|billing/i.test(cleanText)) productSignals.push("pricing-present");
    if (/customers?|case studies?|trusted by|testimonials?|reviews?/i.test(cleanText)) productSignals.push("social-proof");
    if (/api|docs|sdk|developer|documentation/i.test(cleanText)) productSignals.push("developer-product");
    if (/waitlist|early access|join the beta|sign up now/i.test(cleanText)) productSignals.push("waitlist-or-beta");
    if (/demo|book a demo|try for free|start free trial/i.test(cleanText)) productSignals.push("live-demo-or-trial");

    return {
      url: rawUrl,
      normalizedUrl,
      success: true,
      title,
      description,
      headings,
      cleanText,
      productSignals,
      fetchedAt,
    };
  } catch (err) {
    return {
      url: rawUrl,
      normalizedUrl,
      success: false,
      title: null,
      description: null,
      headings: [],
      cleanText: "",
      productSignals: [],
      error: err?.name === "AbortError" ? "Website request timed out (6s)." : (err?.message || "Failed to fetch website."),
      fetchedAt,
    };
  }
}
