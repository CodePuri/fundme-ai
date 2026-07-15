import { getDocumentProxy } from "unpdf";

import type { ArtifactProcessor } from "../contracts";
import type { ArtifactKind, ArtifactResult } from "../types";
import {
  GRILL_UPLOAD_LIMITS,
  hasPdfSignature,
  sanitizeFilename,
  validateFileMetadata,
} from "../validation";

export class ArtifactProcessingError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ArtifactProcessingError";
  }
}

export function boundTextItems(items: Iterable<string>, maxCharacters: number) {
  let text = "";
  let truncated = false;

  for (const item of items) {
    const separator = text ? " " : "";
    const remaining = maxCharacters - text.length - separator.length;
    if (remaining <= 0) {
      truncated = true;
      break;
    }

    const boundedSource = item.slice(0, remaining + 1);
    const normalized = boundedSource.replace(/\s+/g, " ").trim();
    if (normalized) {
      text += `${separator}${normalized.slice(0, remaining)}`;
    }
    if (item.length > boundedSource.length || normalized.length > remaining) {
      truncated = true;
      break;
    }
  }

  return { text, truncated };
}

export function resolveExtractionBoundary({
  characters,
  itemTruncated,
  pageNumber,
  totalPages,
}: {
  characters: number;
  itemTruncated: boolean;
  pageNumber: number;
  totalPages: number;
}) {
  const capReached = characters >= GRILL_UPLOAD_LIMITS.maxCharacters;
  return {
    stop: itemTruncated || capReached,
    truncated: itemTruncated || (capReached && pageNumber < totalPages),
  };
}

export function boundExtractedPages(
  pages: string[],
  totalPages: number,
  sourceTruncated = false,
) {
  const selected = pages.slice(0, GRILL_UPLOAD_LIMITS.maxPages);
  let text = "";
  let pagesParsed = 0;
  let truncated = sourceTruncated || totalPages > GRILL_UPLOAD_LIMITS.maxPages;

  for (const page of selected) {
    const separator = text ? "\n\n" : "";
    const remaining =
      GRILL_UPLOAD_LIMITS.maxCharacters - text.length - separator.length;
    if (remaining <= 0) {
      truncated = true;
      break;
    }
    const boundedSource = page.slice(0, remaining + 1);
    const normalized = boundedSource.replace(/\s+/g, " ").trim();
    if (!normalized) {
      pagesParsed += 1;
      continue;
    }
    text += `${separator}${normalized.slice(0, remaining)}`;
    pagesParsed += 1;
    if (page.length > boundedSource.length || normalized.length > remaining) {
      truncated = true;
      break;
    }
  }

  return {
    text,
    pagesParsed,
    truncated,
  };
}

function* pdfItemStrings(items: ArrayLike<unknown>) {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (typeof item === "object" && item !== null && "str" in item) {
      const text = (item as { str?: unknown }).str;
      if (typeof text === "string") yield text;
    }
  }
}

async function extractPdf(file: File, kind: ArtifactKind): Promise<ArtifactResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPdfSignature(bytes)) {
    throw new ArtifactProcessingError(
      "INVALID_PDF_SIGNATURE",
      "The file content is not a valid PDF.",
      400,
    );
  }

  const fileName = sanitizeFilename(file.name);
  try {
    const pdf = await getDocumentProxy(bytes, { verbosity: 0 });
    try {
      const totalPages = pdf.numPages;
      const pages: string[] = [];
      let extractedCharacters = 0;
      let extractionTruncated = false;
      const pageLimit = Math.min(totalPages, GRILL_UPLOAD_LIMITS.maxPages);
      for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const hasExtractedText = pages.some(Boolean);
        const pageSeparator = hasExtractedText ? 2 : 0;
        const remaining = Math.max(
          0,
          GRILL_UPLOAD_LIMITS.maxCharacters -
            extractedCharacters -
            pageSeparator,
        );
        const boundedPage = boundTextItems(
          pdfItemStrings(content.items),
          remaining,
        );
        pages.push(boundedPage.text);
        extractedCharacters +=
          boundedPage.text.length +
          (boundedPage.text && hasExtractedText ? pageSeparator : 0);
        const boundary = resolveExtractionBoundary({
          characters: extractedCharacters,
          itemTruncated: boundedPage.truncated,
          pageNumber,
          totalPages,
        });
        if (boundary.stop) {
          extractionTruncated = boundary.truncated;
          break;
        }
      }
      const bounded = boundExtractedPages(
        pages,
        totalPages,
        extractionTruncated,
      );
      if (!bounded.text.trim()) {
        return {
          kind,
          status: "unavailable",
          sourceLabel: fileName,
          fileName,
          mimeType: file.type,
          byteSize: file.size,
          text: "",
          pagesParsed: bounded.pagesParsed,
          totalPages,
          truncated: bounded.truncated,
          errorCode: "PDF_TEXT_UNAVAILABLE",
          errorMessage:
            "The PDF contains no extractable text. Founder-entered information was still analyzed.",
        };
      }
      return {
        kind,
        status: "parsed",
        sourceLabel: fileName,
        fileName,
        mimeType: file.type,
        byteSize: file.size,
        text: bounded.text,
        pagesParsed: bounded.pagesParsed,
        totalPages,
        truncated: bounded.truncated,
      };
    } finally {
      await pdf.destroy();
    }
  } catch (error) {
    if (error instanceof ArtifactProcessingError) throw error;
    return {
      kind,
      status: "unavailable",
      sourceLabel: fileName,
      fileName,
      mimeType: file.type,
      byteSize: file.size,
      text: "",
      pagesParsed: 0,
      totalPages: null,
      truncated: false,
      errorCode: "PDF_PARSE_FAILED",
      errorMessage:
        kind === "pitch_deck"
          ? "The deck could not be read. Founder-entered information was still analyzed."
          : "The profile document could not be read. Founder-entered information was still analyzed.",
    };
  }
}

async function extractTextProfile(file: File): Promise<ArtifactResult> {
  const fileName = sanitizeFilename(file.name);
  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(
    await file.arrayBuffer(),
  );
  const normalized = decoded.replace(/\s+/g, " ").trim();
  const text = normalized.slice(0, GRILL_UPLOAD_LIMITS.maxCharacters);
  if (!text) {
    return {
      kind: "profile_document",
      status: "unavailable",
      sourceLabel: fileName,
      fileName,
      mimeType: file.type,
      byteSize: file.size,
      text: "",
      pagesParsed: 0,
      totalPages: null,
      truncated: false,
      errorCode: "TEXT_EMPTY",
      errorMessage: "The profile document did not contain readable text.",
    };
  }
  return {
    kind: "profile_document",
    status: "parsed",
    sourceLabel: fileName,
    fileName,
    mimeType: file.type,
    byteSize: file.size,
    text,
    pagesParsed: 0,
    totalPages: null,
    truncated: normalized.length > GRILL_UPLOAD_LIMITS.maxCharacters,
  };
}

export class DemoArtifactProcessor implements ArtifactProcessor {
  async process(file: File, kind: ArtifactKind) {
    const validation = validateFileMetadata(file, kind);
    if (!validation.ok) {
      throw new ArtifactProcessingError(
        validation.code,
        validation.message,
        validation.code === "FILE_TOO_LARGE" ? 413 : 400,
      );
    }

    if (kind === "profile_document" && file.name.toLowerCase().endsWith(".txt")) {
      return extractTextProfile(file);
    }
    return extractPdf(file, kind);
  }
}

export function notProvidedArtifact(kind: ArtifactKind): ArtifactResult {
  return {
    kind,
    status: "not_provided",
    sourceLabel: kind === "pitch_deck" ? "No pitch deck" : "No profile document",
    fileName: null,
    mimeType: null,
    byteSize: 0,
    text: "",
    pagesParsed: 0,
    totalPages: null,
    truncated: false,
  };
}
