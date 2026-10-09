// Polyfill minimal browser DOM globals required by some PDF parsers in Node.js serverless runtimes
if (typeof globalThis !== "undefined") {
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    (globalThis as any).DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      is2D = true;
      isIdentity = true;
      inverse() { return new (globalThis as any).DOMMatrix(); }
      multiply() { return new (globalThis as any).DOMMatrix(); }
      translate() { return new (globalThis as any).DOMMatrix(); }
      scale() { return new (globalThis as any).DOMMatrix(); }
      rotate() { return new (globalThis as any).DOMMatrix(); }
      transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
    };
  }
  if (typeof (globalThis as any).ImageData === "undefined") {
    (globalThis as any).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.data = new Uint8ClampedArray(w * h * 4);
      }
    };
  }
  if (typeof (globalThis as any).Path2D === "undefined") {
    (globalThis as any).Path2D = class Path2D {};
  }
}

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

function extractRawPdfText(buffer: Buffer | Uint8Array): string {
  const str = Buffer.from(buffer).toString("binary");
  const textChunks: string[] = [];

  // Match (text) Tj and [(text)] TJ PDF operators
  const tjMatches = str.matchAll(/\(([^)]+)\)\s*Tj/g);
  for (const m of tjMatches) {
    if (m[1]) textChunks.push(m[1]);
  }

  const arrayTjMatches = str.matchAll(/\[([\s\S]*?)\]\s*TJ/g);
  for (const m of arrayTjMatches) {
    const inner = m[1];
    const subMatches = inner.matchAll(/\(([^)]+)\)/g);
    for (const sub of subMatches) {
      if (sub[1]) textChunks.push(sub[1]);
    }
  }

  return textChunks.join(" ").replace(/\\([()\\])/g, "$1").trim();
}

export async function parsePdfBuffer(
  buffer: Buffer | Uint8Array,
  filename: string,
): Promise<IngestedPdf> {
  const parsedAt = new Date().toISOString();
  let fullText = "";

  // 1. Try native PDF stream extraction first (fast, reliable, zero serverless crash risk)
  try {
    const rawText = extractRawPdfText(buffer);
    if (rawText && rawText.length > 20) {
      fullText = rawText;
    }
  } catch (err) {
    console.warn("Raw PDF text extraction failed:", err);
  }

  // 2. Try PDFParse library if native extraction returned empty
  if (!fullText) {
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      await parser.destroy();
      fullText = (textResult?.text || "").trim();
    } catch (err: any) {
      console.warn("PDFParse library fallback failed:", err?.message || err);
    }
  }

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

  // Split text into pages/slides
  const rawPages = fullText.split(/\f|\n(?=Slide\s+\d+|Page\s+\d+)|(?=Slide\s+\d+:)/gi);
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
}
