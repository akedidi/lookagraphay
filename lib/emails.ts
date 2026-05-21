/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MODULE EMAILS — LookaGraphy
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Pour activer l'envoi réel d'emails, il suffit de :
 *   1. Choisir un fournisseur : Nodemailer+SMTP / SendGrid / Mailgun / Brevo
 *   2. Ajouter les secrets dans Replit :
 *        SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *        ou : SENDGRID_API_KEY / MAILGUN_API_KEY / BREVO_API_KEY
 *   3. Décommenter le bloc d'envoi dans sendEmail() ci-dessous
 *   4. Installer le package : npm install nodemailer (ou autre)
 *
 * En attendant : les emails sont loggés en console (mode preview).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SITE_NAME = 'LookaGraphy';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lookagraphy.fr';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'contact@lookagraphy.fr';
const FROM_EMAIL = process.env.SMTP_FROM ?? `${SITE_NAME} <contact@lookagraphy.fr>`;

// ─── Types ───────────────────────────────────────────────────────────────────

export type EmailOrderItem = {
  titre: string;
  qty: number;
  prix: number;
  matiere?: string;
  quantite_label?: string;
};

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: EmailOrderItem[];
  deliveryType: 'relay' | 'home' | 'international';
  relayPoint?: { nom?: string; ville?: string; adresse?: string; code_postal?: string } | null;
  shippingAddress?: { rue?: string; ville?: string; code_postal?: string } | null;
  pays?: string;
  shippingCost: number;
  total: number;
  paymentLink?: string;
  notes?: string | null;
};

export type StatusEmailData = {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  notes?: string | null;
};

// ─── Helpers de style email ───────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente de paiement',
  paye: 'Paiement confirmé',
  expedie: 'Expédiée',
  livre: 'Livrée',
  annule: 'Annulée',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  en_attente: 'Votre commande a bien été enregistrée. En attente de confirmation de paiement.',
  paye: 'Votre paiement a été confirmé. Nous préparons votre commande avec soin.',
  expedie: 'Votre commande est en route ! Vous recevrez bientôt les informations de suivi Mondial Relay.',
  livre: 'Votre commande a été livrée. Merci pour votre confiance et votre soutien à l\'art calligraphique.',
  annule: 'Cette commande a été annulée. N\'hésitez pas à nous contacter pour plus d\'informations.',
};

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1A1209;padding:40px;text-align:center;">
              <p style="font-family:'Georgia',serif;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#C9A84C;margin:0 0 12px;">Calligraphie Arabe &amp; Japonaise</p>
              <h1 style="font-family:'Georgia',serif;font-weight:300;font-size:28px;color:#F5F0E8;margin:0;letter-spacing:4px;">${SITE_NAME}</h1>
              <div style="width:50px;height:1px;background:#C9A84C;margin:20px auto 0;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background:#FAF7F2;padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1A1209;padding:28px 40px;text-align:center;">
              <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(245,240,232,0.4);margin:0 0 6px;letter-spacing:1px;">
                ${SITE_NAME} · Paris, France
              </p>
              <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(245,240,232,0.3);margin:0;">
                <a href="${SITE_URL}" style="color:#C9A84C;text-decoration:none;">${SITE_URL}</a>
                &nbsp;·&nbsp;
                <a href="mailto:${ADMIN_EMAIL}" style="color:rgba(245,240,232,0.4);text-decoration:none;">${ADMIN_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(items: EmailOrderItem[]): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding:10px 0;font-family:'Georgia',serif;font-size:15px;color:#1A1209;border-bottom:1px solid rgba(61,43,31,0.08);">
        ${item.titre}${item.matiere ? ` <span style="font-size:12px;color:#C9A84C;">(${item.matiere}${item.quantite_label ? ` · ${item.quantite_label}` : ''})</span>` : ''}
      </td>
      <td style="padding:10px 0;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);border-bottom:1px solid rgba(61,43,31,0.08);">
        ×${item.qty}
      </td>
      <td style="padding:10px 0;text-align:right;font-family:'Georgia',serif;font-size:16px;color:#C9A84C;border-bottom:1px solid rgba(61,43,31,0.08);">
        ${(item.prix * item.qty).toFixed(2)} €
      </td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      ${rows}
    </table>
  `;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const deliveryLine = data.deliveryType === 'relay'
    ? `📍 Point Relais Mondial Relay — ${data.relayPoint?.nom ?? ''}, ${data.relayPoint?.code_postal ?? ''} ${data.relayPoint?.ville ?? ''} (${data.pays ?? 'FR'})`
    : data.deliveryType === 'home'
    ? `🏠 Livraison à domicile — ${data.shippingAddress?.rue ?? ''}, ${data.shippingAddress?.code_postal ?? ''} ${data.shippingAddress?.ville ?? ''}`
    : '🌍 Livraison internationale — devis en cours';

  const content = `
    <h2 style="font-family:'Georgia',serif;font-weight:300;font-size:22px;color:#1A1209;margin:0 0 8px;">
      Commande confirmée
    </h2>
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);margin:0 0 28px;letter-spacing:1px;">
      Réf. <strong style="color:#C9A84C;">${data.orderNumber}</strong>
    </p>

    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:rgba(61,43,31,0.7);line-height:1.7;margin:0 0 24px;">
      Bonjour <strong>${data.customerName}</strong>,<br/>
      Merci pour votre commande sur ${SITE_NAME}. Voici le récapitulatif de votre achat.
    </p>

    <div style="height:1px;background:rgba(61,43,31,0.08);margin:0 0 24px;"></div>

    ${itemsTable(data.items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);padding:6px 0;">Sous-total</td>
        <td style="text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1209;padding:6px 0;">${(data.total - data.shippingCost).toFixed(2)} €</td>
      </tr>
      <tr>
        <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);padding:6px 0;">Livraison</td>
        <td style="text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1209;padding:6px 0;">${data.shippingCost === 0 ? 'Offerte' : `${data.shippingCost.toFixed(2)} €`}</td>
      </tr>
      <tr>
        <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:600;color:#1A1209;padding:12px 0 6px;border-top:1px solid rgba(61,43,31,0.12);">Total</td>
        <td style="text-align:right;font-family:'Georgia',serif;font-size:22px;color:#C9A84C;padding:12px 0 6px;border-top:1px solid rgba(61,43,31,0.12);">${data.total.toFixed(2)} €</td>
      </tr>
    </table>

    <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.2);padding:14px 18px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.55);margin:0 0 4px;text-transform:uppercase;letter-spacing:2px;">Livraison</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1209;margin:0;">${deliveryLine}</p>
    </div>

    ${data.paymentLink ? `
    <div style="text-align:center;margin:28px 0;">
      <a href="${data.paymentLink}" style="display:inline-block;background:#C9A84C;color:#1A1209;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:16px 36px;text-decoration:none;">
        Finaliser le paiement — ${data.total.toFixed(2)} €
      </a>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(61,43,31,0.4);margin:12px 0 0;">
        Votre commande sera traitée dès réception du paiement.
      </p>
    </div>
    ` : ''}

    <div style="height:1px;background:rgba(61,43,31,0.08);margin:24px 0;"></div>

    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.6);line-height:1.7;margin:0 0 12px;">
      Pour suivre l'état de votre commande à tout moment :
    </p>
    <p style="margin:0;">
      <a href="${SITE_URL}/suivi-commande" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C9A84C;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-bottom:1px solid #C9A84C;padding-bottom:2px;">
        Suivre ma commande →
      </a>
    </p>
    ${data.notes ? `
    <div style="margin-top:20px;padding:12px 16px;background:rgba(61,43,31,0.03);border-left:3px solid rgba(201,168,76,0.4);">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.6);margin:0;font-style:italic;">${data.notes}</p>
    </div>
    ` : ''}
  `;
  return emailWrapper(content);
}

function buildAdminNewOrderHtml(data: OrderEmailData): string {
  const content = `
    <h2 style="font-family:'Georgia',serif;font-weight:300;font-size:22px;color:#1A1209;margin:0 0 8px;">
      Nouvelle commande reçue
    </h2>
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);margin:0 0 24px;letter-spacing:1px;">
      Réf. <strong style="color:#C9A84C;">${data.orderNumber}</strong>
    </p>

    <div style="background:rgba(61,43,31,0.03);border:1px solid rgba(61,43,31,0.08);padding:16px 20px;margin-bottom:20px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Client</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1A1209;margin:0;">
        <strong>${data.customerName}</strong><br/>
        <a href="mailto:${data.customerEmail}" style="color:#C9A84C;">${data.customerEmail}</a>
      </p>
    </div>

    ${itemsTable(data.items)}

    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1A1209;margin:0 0 20px;">
      <strong>Total : ${data.total.toFixed(2)} €</strong>
      ${data.shippingCost === 0 ? ' (livraison offerte)' : ` (dont ${data.shippingCost.toFixed(2)} € de livraison)`}
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${SITE_URL}/admin" style="display:inline-block;background:#C9A84C;color:#1A1209;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:14px 28px;text-decoration:none;">
        Gérer la commande →
      </a>
    </div>
  `;
  return emailWrapper(content);
}

function buildStatusUpdateHtml(data: StatusEmailData): string {
  const label = STATUS_LABELS[data.newStatus] ?? data.newStatus;
  const description = STATUS_DESCRIPTIONS[data.newStatus] ?? '';

  const content = `
    <h2 style="font-family:'Georgia',serif;font-weight:300;font-size:22px;color:#1A1209;margin:0 0 8px;">
      Mise à jour de votre commande
    </h2>
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);margin:0 0 28px;letter-spacing:1px;">
      Réf. <strong style="color:#C9A84C;">${data.orderNumber}</strong>
    </p>

    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:rgba(61,43,31,0.7);margin:0 0 20px;">
      Bonjour <strong>${data.customerName}</strong>,
    </p>

    <div style="background:rgba(201,168,76,0.06);border-left:4px solid #C9A84C;padding:20px 24px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C9A84C;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">
        Statut
      </p>
      <p style="font-family:'Georgia',serif;font-size:20px;color:#1A1209;margin:0 0 10px;">${label}</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:rgba(61,43,31,0.65);line-height:1.7;margin:0;">${description}</p>
    </div>

    ${data.notes ? `
    <div style="background:rgba(61,43,31,0.03);border:1px solid rgba(61,43,31,0.08);padding:14px 18px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Message</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1A1209;margin:0;line-height:1.7;">${data.notes}</p>
    </div>
    ` : ''}

    <p style="margin:0;">
      <a href="${SITE_URL}/suivi-commande" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C9A84C;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-bottom:1px solid #C9A84C;padding-bottom:2px;">
        Suivre ma commande →
      </a>
    </p>
  `;
  return emailWrapper(content);
}

// ─── Fonction d'envoi (à connecter) ──────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  /**
   * ── ACTIVATION DE L'ENVOI RÉEL ──────────────────────────────────────────
   *
   * Option A — Nodemailer (SMTP : OVH, Hostinger, Gmail, etc.)
   * ──────────────────────────────────────────────────────────
   * npm install nodemailer @types/nodemailer
   *
   * import nodemailer from 'nodemailer';
   * const transporter = nodemailer.createTransport({
   *   host: process.env.SMTP_HOST,      // ex: smtp.hostinger.com
   *   port: Number(process.env.SMTP_PORT ?? 465),
   *   secure: true,
   *   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
   * });
   * await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
   * return true;
   *
   * Option B — SendGrid
   * ──────────────────────────────────────────────────────────
   * npm install @sendgrid/mail
   *
   * import sgMail from '@sendgrid/mail';
   * sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
   * await sgMail.send({ to, from: FROM_EMAIL, subject, html });
   * return true;
   *
   * Option C — Brevo (ex-Sendinblue, gratuit jusqu'à 300/jour)
   * ──────────────────────────────────────────────────────────
   * npm install @getbrevo/brevo
   *
   * Option D — Mailgun
   * ──────────────────────────────────────────────────────────
   * npm install mailgun.js
   * ────────────────────────────────────────────────────────────────────────
   */

  // Mode preview — log en console tant que l'envoi n'est pas configuré
  console.log(`[EMAIL PREVIEW] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL PREVIEW] HTML length: ${html.length} chars`);
  return true;
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Envoie l'email de confirmation de commande au client.
 * Appelé automatiquement à la création de commande.
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  const subject = `Confirmation de commande ${data.orderNumber} — ${SITE_NAME}`;
  const html = buildOrderConfirmationHtml(data);
  return sendEmail(data.customerEmail, subject, html);
}

/**
 * Notifie l'admin qu'une nouvelle commande vient d'arriver.
 * Appelé automatiquement à la création de commande.
 */
export async function sendAdminNewOrderEmail(data: OrderEmailData): Promise<boolean> {
  const subject = `[${SITE_NAME}] Nouvelle commande ${data.orderNumber} — ${data.total.toFixed(2)} €`;
  const html = buildAdminNewOrderHtml(data);
  return sendEmail(ADMIN_EMAIL, subject, html);
}

/**
 * Informe le client d'un changement de statut de sa commande.
 * Appelé automatiquement lors d'une mise à jour de statut via l'admin.
 */
export async function sendOrderStatusUpdateEmail(data: StatusEmailData): Promise<boolean> {
  const label = STATUS_LABELS[data.newStatus] ?? data.newStatus;
  const subject = `Votre commande ${data.orderNumber} : ${label} — ${SITE_NAME}`;
  const html = buildStatusUpdateHtml(data);
  return sendEmail(data.customerEmail, subject, html);
}
