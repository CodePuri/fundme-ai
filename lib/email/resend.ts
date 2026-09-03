import { Resend } from "resend";
import { renderAssessmentSavedEmail, type AssessmentEmailProps } from "./templates/assessment-saved.ts";

type AssessmentEmailSendOptions = {
  assessmentId: string;
  apiKey?: string;
  fromEmail?: string;
  resend?: Pick<Resend, "emails">;
};

export async function sendAssessmentSavedEmail(
  toEmail: string,
  props: AssessmentEmailProps,
  options: AssessmentEmailSendOptions,
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY;
  const fromEmail = options.fromEmail ?? process.env.RESEND_FROM_EMAIL ?? "FundMe <notifications@mail.tryfundme.in>";

  const { subject, html, text } = renderAssessmentSavedEmail(props);

  if (!apiKey) {
    return { ok: false, error: "Resend is not configured." };
  }

  try {
    const resend = options.resend ?? new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
      text,
    }, {
      idempotencyKey: `assessment-saved:${options.assessmentId}`,
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
