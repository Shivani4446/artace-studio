type SendTransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: SendTransactionalEmailInput): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM) {
    throw new Error("Resend is not configured (RESEND_API_KEY/RESEND_FROM missing).");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Email delivery failed.");
  }
}
