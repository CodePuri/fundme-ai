export type AssessmentEmailProps = {
  founderName: string;
  startupName: string;
  readinessScore: number;
  verdict: string;
  workspaceUrl: string;
  shareUrl?: string;
};

export function renderAssessmentSavedEmail(props: AssessmentEmailProps): { subject: string; html: string; text: string } {
  const { founderName, startupName, readinessScore, verdict, workspaceUrl, shareUrl } = props;
  const subject = `Your FundMe Funding Readiness Diagnosis (${readinessScore}/100) — ${startupName}`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${subject}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #fcfbf9; color: #171513; margin: 0; padding: 24px; }
.container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #ede8e1; border-radius: 16px; overflow: hidden; }
.header { padding: 32px 32px 24px; border-bottom: 1px solid #ede8e1; text-align: center; font-size: 20px; font-weight: 700; }
.content { padding: 32px; }
.score-card { background: #faf8f5; border: 1px solid #ede8e1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
.score { font-size: 48px; font-weight: 800; color: #ff6b3d; line-height: 1; }
.score-max { font-size: 18px; font-weight: 500; color: #78716c; }
.verdict { font-size: 20px; font-weight: 600; color: #171513; margin-top: 12px; }
.btn { display: inline-block; background-color: #171513; color: #ffffff !important; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-size: 15px; font-weight: 600; text-align: center; margin-top: 16px; }
.footer { padding: 24px 32px; background: #faf8f5; border-top: 1px solid #ede8e1; font-size: 12px; color: #78716c; text-align: center; }
</style></head><body>
<div class="container">
<div class="header">FundMe</div>
<div class="content">
<p style="font-size: 16px; margin: 0 0 16px;">Hi ${founderName || "Founder"},</p>
<p style="font-size: 15px; line-height: 1.5; color: #44403c; margin: 0 0 16px;">
Your funding readiness diagnosis for <strong>${startupName}</strong> has been saved to your secure workspace.
</p>
<div class="score-card">
<div class="score">${readinessScore}<span class="score-max">/100</span></div>
<div class="verdict">${verdict}</div>
</div>
<div style="text-align: center;">
<a href="${workspaceUrl}" class="btn">Open Your Workspace</a>
</div>
${shareUrl ? `<p style="font-size: 13px; color: #78716c; margin-top: 24px; text-align: center;">Public Share Link: <a href="${shareUrl}" style="color: #ff6b3d;">${shareUrl}</a></p>` : ""}
</div>
<div class="footer"><p style="margin: 0;">FundMe · Get assessed before you apply · No spam, just real startup intelligence.</p></div>
</div></body></html>`;

  const text = `Hi ${founderName || "Founder"},

Your funding readiness diagnosis for ${startupName} has been saved to your workspace.

Readiness Score: ${readinessScore}/100
Verdict: ${verdict}

Access your saved workspace:
${workspaceUrl}
${shareUrl ? `\nPublic share link: ${shareUrl}\n` : ""}
FundMe — Stop pitching blind. Get assessed before you apply.
`;

  return { subject, html, text };
}
