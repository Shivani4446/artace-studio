// lib/email/templates.ts
import { buildSiteUrl } from "@/lib/site";

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const wrapEmailHtml = (bodyHtml: string) => `<!doctype html>
<html>
  <body style="margin:0; padding:0; background-color:#f1f0ed; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f0ed; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#fcfaf7; border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px 32px; text-align:center;">
                <img src="${buildSiteUrl("/images/logo.png")}" alt="Artace Studio" width="140" style="display:inline-block; border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px; color:#171717; font-size:15px; line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px 32px; border-top:1px solid #e2ddd3; color:#6b6962; font-size:12px; text-align:center;">
                Artace Studio &middot; <a href="${buildSiteUrl("/")}" style="color:#1f3f63; text-decoration:underline;">artacestudio.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const buildWelcomeEmail = ({ firstName }: { firstName: string }): EmailContent => {
  const name = firstName || "there";
  const shopUrl = buildSiteUrl("/shop");

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px 0; font-size:22px; color:#222327;">Welcome to Artace Studio, ${escapeHtml(name)}!</h1>
    <p style="margin:0 0 16px 0;">Your account has been created successfully. You can now browse our collection of handcrafted canvas paintings, track your orders, and check out faster next time.</p>
    <p style="margin:0 0 24px 0;">
      <a href="${shopUrl}" style="display:inline-block; background-color:#1f3f63; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold;">Start Shopping</a>
    </p>
    <p style="margin:0; color:#6b6962; font-size:13px;">If you didn't create this account, please contact us right away.</p>
  `);

  const text = [
    `Welcome to Artace Studio, ${name}!`,
    "",
    "Your account has been created successfully. You can now browse our collection of handcrafted canvas paintings, track your orders, and check out faster next time.",
    "",
    `Start shopping: ${shopUrl}`,
    "",
    "If you didn't create this account, please contact us right away.",
  ].join("\n");

  return { subject: "Welcome to Artace Studio", html, text };
};

export const buildPasswordResetEmail = ({
  firstName,
  resetUrl,
}: {
  firstName: string;
  resetUrl: string;
}): EmailContent => {
  const name = firstName || "there";

  const html = wrapEmailHtml(`
    <h1 style="margin:0 0 16px 0; font-size:22px; color:#222327;">Reset your password</h1>
    <p style="margin:0 0 16px 0;">Hi ${escapeHtml(name)}, we received a request to reset your Artace Studio password. Click the button below to choose a new one.</p>
    <p style="margin:0 0 24px 0;">
      <a href="${resetUrl}" style="display:inline-block; background-color:#1f3f63; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold;">Reset Password</a>
    </p>
    <p style="margin:0 0 16px 0; color:#6b6962; font-size:13px;">This link will expire soon and can only be used once. If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
    <p style="margin:0; word-break:break-all; font-size:12px;"><a href="${resetUrl}" style="color:#1f3f63;">${resetUrl}</a></p>
  `);

  const text = [
    `Hi ${name},`,
    "",
    "We received a request to reset your Artace Studio password. Use the link below to choose a new one:",
    "",
    resetUrl,
    "",
    "This link will expire soon and can only be used once. If you didn't request this, you can safely ignore this email — your password won't be changed.",
  ].join("\n");

  return { subject: "Reset your Artace Studio password", html, text };
};
