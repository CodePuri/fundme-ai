import { Resend } from "resend";
import { renderAssessmentSavedEmail, type AssessmentEmailProps } from "./templates/assessment-saved.ts";

export async function sendAssessmentSavedEmail(
  toEmail: string,
  props: AssessmentEmailProps
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "FundMe <notifications@mail.tryfundme.in>";

  const { subject, html, text } = renderAssessmentSavedEmail(props);

  if (!apiKey) {
    console.log("[Resend Sandbox Log] Transactional email generated (API key pending):", {
      to: toEmail,
      from: fromEmail,
      subject,
      workspaceUrl: props.workspaceUrl,
    });
    return { ok: true, messageId: "mock_msg_" + Date.now() };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.warn("Resend email send warning:", result.error);
      return { ok: false, error: result.error.message };
    }

    return { ok: true, messageId: result.data?.id };
  } catch (err: any) {
    console.error("Resend execution error:", err);
    return { ok: false, error: err.message };
  }
}
