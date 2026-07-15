import type { GrillReport } from "../types";

export type ShareOutcome = "copied" | "shared";

export function shareOutcomeMessage(outcome: ShareOutcome) {
  return outcome === "shared" ? "Share sheet opened" : "Share summary copied";
}

export function formatShareSummary(report: GrillReport) {
  const strongest = report.dimensions.find((item) => item.id === report.strongestDimension);
  const weakest = report.dimensions.find((item) => item.id === report.weakestDimension);
  return [
    `${report.startupName || "My startup"} scored ${report.overallScore}/100 on the Fundme Funding Readiness Grill.`,
    `Evidence coverage: ${report.evidenceCoverage}% (${report.confidence} confidence).`,
    strongest ? `Strongest: ${strongest.label} (${strongest.score}/100).` : "",
    weakest ? `Biggest gap: ${weakest.label} (${weakest.score}/100).` : "",
    `Rubric: ${report.rubricVersion}. This is a readiness score, not a funding probability.`,
  ].filter(Boolean).join("\n");
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

export async function createShareCardBlob(report: GrillReport) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Share-card rendering is unavailable in this browser.");

  context.fillStyle = "#f6f1ea";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#171513";
  context.fillRect(0, 0, 1200, 86);
  context.fillStyle = "#ff6b3d";
  context.fillRect(0, 86, 1200, 7);

  context.fillStyle = "#ffffff";
  context.font = "700 30px Arial, sans-serif";
  context.fillText("FUNDME", 64, 56);
  context.font = "600 20px Arial, sans-serif";
  context.fillStyle = "#ffb49d";
  context.fillText("FUNDING READINESS GRILL", 820, 55);

  context.fillStyle = "#171513";
  context.font = "700 28px Arial, sans-serif";
  context.fillText(report.startupName || "Startup report", 64, 158);
  context.font = "700 150px Georgia, serif";
  context.fillText(String(report.overallScore), 58, 335);
  context.font = "700 36px Arial, sans-serif";
  context.fillStyle = "#b44828";
  context.fillText("/ 100", 286, 324);

  context.font = "700 19px Arial, sans-serif";
  context.fillStyle = "#171513";
  context.fillText("FUNDING READINESS", 66, 385);
  context.font = "500 18px Arial, sans-serif";
  context.fillStyle = "#655e56";
  context.fillText(`${report.evidenceCoverage}% evidence coverage · ${report.confidence} confidence`, 66, 420);

  context.fillStyle = "#ffffff";
  context.strokeStyle = "rgba(23,21,19,0.12)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(520, 138, 616, 350, 8);
  context.fill();
  context.stroke();

  const strongest = report.dimensions.find((item) => item.id === report.strongestDimension);
  const weakest = report.dimensions.find((item) => item.id === report.weakestDimension);
  context.fillStyle = "#2d8b57";
  context.font = "700 17px Arial, sans-serif";
  context.fillText("STRONGEST SIGNAL", 560, 190);
  context.fillStyle = "#171513";
  context.font = "700 29px Arial, sans-serif";
  context.fillText(`${strongest?.label ?? "Evidence"} · ${strongest?.score ?? 0}`, 560, 232);
  context.fillStyle = "#b44828";
  context.font = "700 17px Arial, sans-serif";
  context.fillText("BIGGEST GAP", 560, 295);
  context.fillStyle = "#171513";
  context.font = "700 29px Arial, sans-serif";
  context.fillText(`${weakest?.label ?? "Readiness"} · ${weakest?.score ?? 0}`, 560, 337);
  context.fillStyle = "#655e56";
  context.font = "500 20px Arial, sans-serif";
  drawWrappedText(context, report.verdict, 560, 390, 520, 30, 3);

  context.fillStyle = "#171513";
  context.font = "600 17px Arial, sans-serif";
  context.fillText("A readiness score, not a funding probability.", 64, 565);
  context.fillStyle = "#81786e";
  context.fillText(report.rubricVersion, 862, 565);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The share card could not be rendered."));
    }, "image/png");
  });
}

export async function downloadShareCard(report: GrillReport) {
  const blob = await createShareCardBlob(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${(report.startupName || "fundme").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-funding-readiness.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function copyReportSummary(report: GrillReport) {
  const summary = formatShareSummary(report);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = summary;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy is unavailable in this browser.");
}

export async function shareReport(report: GrillReport) {
  const summary = formatShareSummary(report);
  if (!navigator.share) {
    await copyReportSummary(report);
    return "copied" as const satisfies ShareOutcome;
  }
  const blob = await createShareCardBlob(report);
  const file = new File([blob], "fundme-readiness.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: "My Fundme Funding Readiness", text: summary, files: [file] });
  } else {
    await navigator.share({ title: "My Fundme Funding Readiness", text: summary });
  }
  return "shared" as const satisfies ShareOutcome;
}
