export function verificationEmail(params: { name: string; url: string }) {
  const { name, url } = params;
  return {
    subject: "Verifica tu cuenta de QRForge / Verify your QRForge account",
    text: [
      `Hola ${name},`,
      "",
      "Confirma tu dirección de correo para activar tu cuenta de QRForge:",
      url,
      "",
      "Si no creaste esta cuenta, ignora este mensaje.",
      "",
      "---",
      "",
      `Hi ${name},`,
      "",
      "Confirm your email address to activate your QRForge account:",
      url,
      "",
      "If you didn't create this account, you can ignore this message.",
    ].join("\n"),
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#09090b;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#141419;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:36px;">
            <tr>
              <td style="padding-bottom:24px;">
                <span style="font-size:20px;font-weight:600;color:#f4f4f5;letter-spacing:-0.02em;">
                  <span style="color:#818cf8;">qr</span>forge
                </span>
              </td>
            </tr>
            <tr>
              <td style="color:#f4f4f5;font-size:16px;line-height:1.6;padding-bottom:8px;">
                Hola ${name},
              </td>
            </tr>
            <tr>
              <td style="color:#a1a1aa;font-size:14px;line-height:1.6;padding-bottom:24px;">
                Confirma tu dirección de correo para activar tu cuenta.<br/>
                <em>Confirm your email address to activate your account.</em>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${url}" style="display:inline-block;background:#818cf8;color:#0b0b14;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;">
                  Verificar cuenta · Verify account
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#6b6b76;font-size:12px;line-height:1.6;">
                Si no creaste esta cuenta, ignora este mensaje.<br/>
                <em>If you didn't create this account, you can ignore this message.</em>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
