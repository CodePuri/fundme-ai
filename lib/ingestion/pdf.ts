import { PDFParse } from "pdf-parse";

export type IngestedPdf = {
  filename: string;
  success: boolean;
  pageCount: number;
  extractedText: string;
  slideSections: Array<{ slideIndex: number; title: string; content: string }>;
  detectedSections: string[];
  error?: string;
  parsedAt: string;
};

export async function parsePdfBuffer(
  buffer: Buffer | Uint8Array,
  filename: string,
): Promise<IngestedPdf> {
  const parsedAt = new Date().toISOString();
  try {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const textResult = await parser.getText();
    await parser.destroy();

    const fullText = (textResult?.text || "").trim();
    if (!fullText) {
      return {
        filename,
        success: false,
        pageCount: 0,
        extractedText: "",
        slideSections: [],
        detectedSections: [],
        error: "PDF was empty or contained only scanned images without extractable text.",
        parsedAt,
      };
    }

    // Split text into pages/slides if page markers exist, or split by form feed / slide breaks
    const rawPages = fullText.split(/\f|\n(?=Slide\s+\d+|Page\s+\d+)/gi);
    const pages = rawPages.length > 1 ? rawPages : fullText.split(/\n{3,}/);

    const slideSections = pages.map((pageText, index) => {
      const clean = pageText.replace(/\s+/g, " ").trim();
      const firstLine = clean.slice(0, 80);
      return {
        slideIndex: index + 1,
        title: firstLine || `Slide ${index + 1}`,
        content: clean.slice(0, 1000),
      };
    }).filter((s) => s.content.length > 0).slice(0, 30);

    const detectedSections: string[] = [];
    const lower = fullText.toLowerCase();
    if (/\b(problem|pain point|challenge|the problem)\b/i.test(lower)) detectedSections.push("problem");
    if (/\b(solution|how it works|our product|what we do|the solution)\b/i.test(lower)) detectedSections.push("solution");
    if (/\b(market size|tam|sam|som|market opportunity)\b/i.test(lower)) detectedSections.push("market");
    if (/\b(traction|revenue|mrr|arr|users|growth|customers|metrics)\b/i.test(lower)) detectedSections.push("traction");
    if (/\b(business model|monetization|pricing|unit economics)\b/i.test(lower)) detectedSections.push("business-model");
    if (/\b(competition|competitive landscape|alternatives|differentiation|why us)\b/i.test(lower)) detectedSections.push("competition");
    if (/\b(team|founders|advisors|experience|background)\b/i.test(lower)) detectedSections.push("team");
    if (/\b(the ask|fundraising|use of funds|raising|round|milestones)\b/i.test(lower)) detectedSections.push("funding-ask");

    return {
      filename,
      success: true,
      pageCount: slideSections.length || 1,
      extractedText: fullText.slice(0, 20_000),
      slideSections,
      detectedSections,
      parsedAt,
    };
  } catch (err) {
    return {
      filename,
      success: false,
      pageCount: 0,
      extractedText: "",
      slideSections: [],
      detectedSections: [],
      error: err?.message || "Failed to parse PDF document.",
      parsedAt,
    };
  }
}
