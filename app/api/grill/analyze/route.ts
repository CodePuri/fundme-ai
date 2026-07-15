import { buildDossier } from "@/lib/grill/evidence";
import { createServerRuntime, LiveRuntimeConfigurationError } from "@/lib/grill/runtime";
import { createDemoServerProviders } from "@/lib/grill/server/demo-runtime";
import {
  ArtifactProcessingError,
  notProvidedArtifact,
} from "@/lib/grill/server/pdf";
import type {
  AnalyzeErrorResponse,
  AnalyzeSuccessResponse,
  ArtifactResult,
} from "@/lib/grill/types";
import {
  GRILL_UPLOAD_LIMITS,
  parseGrillIntake,
  validateCombinedFileSize,
  validateGrillIntake,
} from "@/lib/grill/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

class RequestTooLargeError extends Error {}

function errorResponse(
  status: number,
  code: string,
  message: string,
  field?: string,
) {
  const body: AnalyzeErrorResponse = {
    ok: false,
    error: { code, message, ...(field ? { field } : {}) },
  };
  return Response.json(body, { status });
}

function getOptionalFile(form: FormData, key: string) {
  const value = form.get(key);
  return value instanceof File ? value : null;
}

async function readBoundedFormData(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > GRILL_UPLOAD_LIMITS.maxRequestBytes
  ) {
    throw new RequestTooLargeError();
  }

  if (!request.body) return request.formData();

  const reader = request.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let bytesRead = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > GRILL_UPLOAD_LIMITS.maxRequestBytes) {
        await reader.cancel();
        throw new RequestTooLargeError();
      }
      const copy = new Uint8Array(value.byteLength);
      copy.set(value);
      chunks.push(copy.buffer);
    }
  } finally {
    reader.releaseLock();
  }

  const replay = new Request(request.url, {
    method: "POST",
    headers: request.headers,
    body: new Blob(chunks),
  });
  return replay.formData();
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "Submit the grill intake as multipart form data.");
    }

    createServerRuntime();
    let form: FormData;
    try {
      form = await readBoundedFormData(request);
    } catch (error) {
      if (error instanceof RequestTooLargeError) {
        return errorResponse(
          413,
          "REQUEST_TOO_LARGE",
          "The analysis request is too large.",
        );
      }
      return errorResponse(
        400,
        "MALFORMED_MULTIPART",
        "The uploaded form data is malformed.",
      );
    }
    const rawIntake = form.get("intake");
    if (typeof rawIntake !== "string") {
      return errorResponse(400, "INVALID_INTAKE", "Review the founder and startup information and try again.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawIntake);
    } catch {
      return errorResponse(400, "INVALID_INTAKE", "Review the founder and startup information and try again.");
    }
    const intake = parseGrillIntake(parsedJson);
    if (!intake || Object.keys(validateGrillIntake(intake)).length > 0) {
      return errorResponse(400, "INVALID_INTAKE", "Review the founder and startup information and try again.");
    }

    const profileFile = getOptionalFile(form, "profileFile");
    const deckFile = getOptionalFile(form, "deckFile");
    const combinedValidation = validateCombinedFileSize(
      [profileFile, deckFile].filter((file): file is File => file !== null),
    );
    if (!combinedValidation.ok) {
      return errorResponse(413, combinedValidation.code, combinedValidation.message);
    }

    const providers = createDemoServerProviders();
    const artifacts: ArtifactResult[] = [];
    artifacts.push(
      profileFile
        ? await providers.artifactProcessor.process(profileFile, "profile_document")
        : notProvidedArtifact("profile_document"),
    );
    artifacts.push(
      deckFile
        ? await providers.artifactProcessor.process(deckFile, "pitch_deck")
        : notProvidedArtifact("pitch_deck"),
    );

    const dossier = buildDossier(intake, artifacts);
    const guidance = providers.knowledgeRetriever.retrieve(dossier, 5);
    const report = providers.grillEngine.analyze(dossier, guidance);
    const body: AnalyzeSuccessResponse = {
      ok: true,
      runtimeMode: "demo",
      report,
      artifacts,
    };
    return Response.json(body);
  } catch (error) {
    if (error instanceof ArtifactProcessingError) {
      return errorResponse(error.status, error.code, error.message);
    }
    if (error instanceof LiveRuntimeConfigurationError) {
      return errorResponse(
        503,
        "LIVE_RUNTIME_NOT_CONFIGURED",
        "The live assessment runtime is not configured.",
      );
    }
    return errorResponse(
      500,
      "ANALYSIS_FAILED",
      "The analysis could not be completed. Your browser draft is still available.",
    );
  }
}
