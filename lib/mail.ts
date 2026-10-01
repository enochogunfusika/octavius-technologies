import formData from "form-data";
import Mailgun from "mailgun.js";
import { formatNaira, shortId } from "./types";

type EmailOrder = {
  id: string;
  full_name: string;
  address: string;
  city: string;
  total: number;
  items: { name: string; qty: number; unitPrice: number }[];
};

function getClient() {
  const key = process.env.MAILGUN_API_KEY;
  if (!key || !process.env.MAILGUN_DOMAIN) {
    throw new Error("Missing MAILGUN_API_KEY or MAILGUN_DOMAIN in your environment.");
  }
  return new Mailgun(formData).client({
    username: "api",
    key,
    url: process.env.MAILGUN_API_URL || "https://api.mailgun.net",
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

export async function sendOrderConfirmation(to: string, order: EmailOrder) {
  const domain = process.env.MAILGUN_DOMAIN!;
  const ref = shortId(order.id);

  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(i.name)} × ${i.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatNaira(i.unitPrice * i.qty)}</td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#111">
    <div style="background:#0b1220;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
      <strong style="font-size:18px">Octavius Technologies</strong>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
      <h2 style="margin:0 0 8px">Thanks for your order, ${escapeHtml(order.full_name.split(" ")[0])}!</h2>
      <p style="margin:0 0 16px;color:#555">Your order <strong>#${ref}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
        <tr><td style="padding:12px 0;font-weight:bold">Total</td>
            <td style="padding:12px 0;font-weight:bold;text-align:right">${formatNaira(order.total)}</td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:14px;color:#555">
        Delivering to: ${escapeHtml(order.address)}, ${escapeHtml(order.city)}
      </p>
    </div>
  </div>`;

  const text =
    `Thanks for your order! Order #${ref} is confirmed.\n\n` +
    order.items.map((i) => `${i.name} x ${i.qty} — ${formatNaira(i.unitPrice * i.qty)}`).join("\n") +
    `\n\nTotal: ${formatNaira(order.total)}\nDelivering to: ${order.address}, ${order.city}\n\n— Octavius Technologies`;

  await getClient().messages.create(domain, {
    from: `Octavius Technologies <orders@${domain}>`,
    to: [to],
    subject: `Order confirmed — #${ref}`,
    text,
    html,
  });
}
