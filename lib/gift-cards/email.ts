const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

export const sendGiftCardEmail = async (input: {
  to: string;
  code: string;
  amount: number;
}): Promise<void> => {
  if (!RESEND_API_KEY || !RESEND_FROM || !input.to) return;

  const text = [
    "Thank you for your Artace Gift Card purchase!",
    "",
    `Your code: ${input.code}`,
    `Value: ₹${input.amount.toLocaleString("en-IN")}`,
    "",
    "This code never expires and can be redeemed at checkout on artacestudio.com,",
    "in full or across multiple orders — any unused balance carries forward.",
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [input.to],
      subject: "Your Artace Gift Card",
      text,
    }),
  });
};
