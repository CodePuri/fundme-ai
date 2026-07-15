import type { AnalyzeResponse, DemoIdentity, GrillIntake } from "../types";
import { isAnalyzeResponse } from "../validation";

export class GrillRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GrillRequestError";
  }
}

export function analyzeGrill({
  intake,
  identity,
  profileFile,
  deckFile,
  onProgress,
  signal,
}: {
  intake: GrillIntake;
  identity: DemoIdentity;
  profileFile: File | null;
  deckFile: File | null;
  onProgress: (progress: number) => void;
  signal?: AbortSignal;
}) {
  return new Promise<AnalyzeResponse>((resolve, reject) => {
    const form = new FormData();
    form.set("intake", JSON.stringify(intake));
    form.set("sessionId", identity.sessionId);
    if (profileFile) form.set("profileFile", profileFile);
    if (deckFile) form.set("deckFile", deckFile);

    const request = new XMLHttpRequest();
    const cleanup = () => signal?.removeEventListener("abort", abortRequest);
    const abortRequest = () => request.abort();
    request.open("POST", "/api/grill/analyze");
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.max(1, Math.min(95, Math.round((event.loaded / event.total) * 95))));
      }
    });
    request.addEventListener("load", () => {
      cleanup();
      onProgress(100);
      const response: unknown = request.response;
      if (!isAnalyzeResponse(response)) {
        reject(
          new GrillRequestError(
            "INVALID_RESPONSE",
            "The analysis service returned an invalid response.",
            request.status,
          ),
        );
        return;
      }
      if (!response.ok) {
        reject(new GrillRequestError(response.error.code, response.error.message, request.status));
        return;
      }
      resolve(response);
    });
    request.addEventListener("error", () => {
      cleanup();
      reject(
        new GrillRequestError(
          "NETWORK_ERROR",
          "The analysis request could not reach the server. Your browser draft is still saved.",
          0,
        ),
      );
    });
    request.addEventListener("abort", () => {
      cleanup();
      reject(new GrillRequestError("REQUEST_ABORTED", "The analysis request was cancelled.", 0));
    });
    if (signal?.aborted) {
      reject(new GrillRequestError("REQUEST_ABORTED", "The analysis request was cancelled.", 0));
      return;
    }
    signal?.addEventListener("abort", abortRequest, { once: true });
    request.send(form);
  });
}
