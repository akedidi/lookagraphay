/**
 * Emails transactionnels LookaGraphy — envoi via Gmail API si configuré.
 */

import { isGmailConfigured, sendGmailMessage } from '@/lib/gmail';

const SITE_NAME = 'LookaGraphy';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lookagraphy.fr';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'contact@lookagraphy.fr';

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
  customerPhone?: string | null;
  items: EmailOrderItem[];
  deliveryType: 'relay' | 'home' | 'international';
  relayPoint?: {
    nom?: string;
    ville?: string;
    adresse?: string;
    code_postal?: string;
    id?: string;
  } | null;
  shippingAddress?: {
    rue?: string;
    ville?: string;
    code_postal?: string;
    complement?: string;
  } | null;
  pays?: string;
  paysResidence?: string | null;
  shippingCost: number;
  total: number;
  paymentLink?: string;
  notes?: string | null;
  /** true = paiement reçu (email de remerciement) */
  paymentConfirmed?: boolean;
};

export type StatusEmailData = {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  notes?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente de paiement',
  paye: 'Paiement confirmé',
  expedie: 'Expédiée',
  livre: 'Livrée',
  annule: 'Annulée',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  en_attente:
    'Votre commande a bien été enregistrée. En attente de confirmation de paiement.',
  paye: 'Votre paiement a été confirmé. Nous préparons votre commande avec soin.',
  expedie:
    'Votre commande a été expédiée. Retrouvez ci-dessous le numéro de suivi pour suivre votre colis.',
  livre:
    "Votre commande a été livrée. Merci pour votre confiance et votre soutien à l'art calligraphique.",
  annule:
    "Cette commande a été annulée. N'hésitez pas à nous contacter pour plus d'informations.",
};

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  relay: 'Point relais / locker Mondial Relay',
  home: 'Livraison à domicile (France)',
  international: 'Livraison internationale',
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
          <tr>
            <td style="background:#1A1209;padding:40px;text-align:center;">
              <p style="font-family:'Georgia',serif;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#C9A84C;margin:0 0 12px;">Calligraphie Arabe &amp; Japonaise</p>
              <h1 style="font-family:'Georgia',serif;font-weight:300;font-size:28px;color:#F5F0E8;margin:0;letter-spacing:4px;">${SITE_NAME}</h1>
              <div style="width:50px;height:1px;background:#C9A84C;margin:20px auto 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="background:#FAF7F2;padding:40px;">${content}</td>
          </tr>
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
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;font-family:'Georgia',serif;font-size:15px;color:#1A1209;border-bottom:1px solid rgba(61,43,31,0.08);">
        ${esc(item.titre)}${item.matiere ? ` <span style="font-size:12px;color:#C9A84C;">(${esc(item.matiere)}${item.quantite_label ? ` · ${esc(item.quantite_label)}` : ''})</span>` : ''}
      </td>
      <td style="padding:10px 0;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);border-bottom:1px solid rgba(61,43,31,0.08);">
        ×${item.qty}
      </td>
      <td style="padding:10px 0;text-align:right;font-family:'Georgia',serif;font-size:16px;color:#C9A84C;border-bottom:1px solid rgba(61,43,31,0.08);">
        ${(item.prix * item.qty).toFixed(2)} €
      </td>
    </tr>
  `
    )
    .join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">${rows}</table>`;
}

function buildDeliveryBlock(data: OrderEmailData): string {
  const typeLabel = DELIVERY_TYPE_LABELS[data.deliveryType] ?? data.deliveryType;

  let details = '';
  if (data.deliveryType === 'relay' && data.relayPoint) {
    const r = data.relayPoint;
    details = `
      <strong>${esc(r.nom)}</strong><br/>
      ${r.adresse ? `${esc(r.adresse)}<br/>` : ''}
      ${esc(r.code_postal)} ${esc(r.ville)}
      ${r.id ? `<br/><span style="opacity:0.75;">ID point : ${esc(r.id)}</span>` : ''}
      <br/><span style="opacity:0.75;">Pays livraison : ${esc(data.pays ?? 'FR')}</span>
    `;
  } else if (data.deliveryType === 'home' && data.shippingAddress) {
    const a = data.shippingAddress;
    details = `
      ${esc(a.rue)}${a.complement ? `<br/>${esc(a.complement)}` : ''}<br/>
      ${esc(a.code_postal)} ${esc(a.ville)}
      <br/><span style="opacity:0.75;margin-top:6px;display:inline-block;">Le transporteur et le suivi vous seront communiqués à l'expédition.</span>
    `;
  } else if (data.deliveryType === 'international') {
    details = 'Devis et modalités en cours — Looka vous recontactera.';
  }

  return `
    <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.2);padding:14px 18px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.55);margin:0 0 4px;text-transform:uppercase;letter-spacing:2px;">Livraison — ${esc(typeLabel)}</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1209;margin:0;line-height:1.7;">${details}</p>
      ${data.paysResidence ? `<p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.55);margin:10px 0 0;">Pays de résidence : ${esc(data.paysResidence)}</p>` : ''}
    </div>
  `;
}

function trackingInstructionsBlock(orderNumber: string): string {
  return `
    <div style="background:rgba(61,43,31,0.03);border:1px solid rgba(61,43,31,0.08);padding:16px 20px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Suivi de commande</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1209;margin:0;line-height:1.7;">
        Consultez l'avancement sur notre site avec votre <strong>numéro de commande</strong>
        <span style="color:#C9A84C;">${esc(orderNumber)}</span>
        et l'<strong>email</strong> utilisé lors de l'achat.
      </p>
      <p style="margin:14px 0 0;">
        <a href="${SITE_URL}/suivi-commande" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C9A84C;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-bottom:1px solid #C9A84C;padding-bottom:2px;">
          Accéder au suivi →
        </a>
      </p>
    </div>
  `;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const paid = data.paymentConfirmed === true;
  const title = paid ? 'Merci pour votre achat' : 'Votre commande est enregistrée';
  const intro = paid
    ? `Nous avons bien reçu votre paiement. Votre commande sera préparée avec le plus grand soin — merci de soutenir l'art calligraphique de ${SITE_NAME}.`
    : `Merci pour votre confiance. Voici le récapitulatif de votre commande. Finalisez le paiement pour que nous puissions la traiter.`;

  const content = `
    <h2 style="font-family:'Georgia',serif;font-weight:300;font-size:22px;color:#1A1209;margin:0 0 8px;">
      ${title}
    </h2>
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);margin:0 0 28px;letter-spacing:1px;">
      Réf. <strong style="color:#C9A84C;">${esc(data.orderNumber)}</strong>
      ${paid ? ' · <span style="color:#3d7a4a;">Paiement confirmé</span>' : ''}
    </p>

    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:rgba(61,43,31,0.7);line-height:1.7;margin:0 0 24px;">
      Bonjour <strong>${esc(data.customerName)}</strong>,<br/>
      ${intro}
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

    ${buildDeliveryBlock(data)}
    ${paid ? trackingInstructionsBlock(data.orderNumber) : ''}

    ${
      !paid && data.paymentLink
        ? `
    <div style="text-align:center;margin:28px 0;">
      <a href="${esc(data.paymentLink)}" style="display:inline-block;background:#C9A84C;color:#1A1209;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:16px 36px;text-decoration:none;">
        Finaliser le paiement — ${data.total.toFixed(2)} €
      </a>
    </div>
    `
        : ''
    }

    ${
      !paid
        ? `
    <p style="margin:0;">
      <a href="${SITE_URL}/suivi-commande" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C9A84C;letter-spacing:2px;text-transform:uppercase;text-decoration:none;border-bottom:1px solid #C9A84C;padding-bottom:2px;">
        Suivre ma commande →
      </a>
    </p>
    `
        : ''
    }

    ${
      data.notes
        ? `
    <div style="margin-top:20px;padding:12px 16px;background:rgba(61,43,31,0.03);border-left:3px solid rgba(201,168,76,0.4);">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Votre message</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.6);margin:0;font-style:italic;">${esc(data.notes)}</p>
    </div>
    `
        : ''
    }

    ${
      paid
        ? `
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);line-height:1.7;margin:24px 0 0;">
      Une question ? Répondez à cet email ou écrivez-nous à
      <a href="mailto:${ADMIN_EMAIL}" style="color:#C9A84C;text-decoration:none;">${ADMIN_EMAIL}</a>.
    </p>
    `
        : ''
    }
  `;
  return emailWrapper(content);
}

function buildAdminNewOrderHtml(data: OrderEmailData): string {
  const paid = data.paymentConfirmed === true;

  const content = `
    <h2 style="font-family:'Georgia',serif;font-weight:300;font-size:22px;color:#1A1209;margin:0 0 8px;">
      ${paid ? 'Nouvel achat confirmé' : 'Nouvelle commande (paiement en attente)'}
    </h2>
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:rgba(61,43,31,0.55);margin:0 0 24px;letter-spacing:1px;">
      Réf. <strong style="color:#C9A84C;">${esc(data.orderNumber)}</strong>
      · ${data.total.toFixed(2)} €
    </p>

    <div style="background:rgba(61,43,31,0.03);border:1px solid rgba(61,43,31,0.08);padding:16px 20px;margin-bottom:20px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Client</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1A1209;margin:0;line-height:1.8;">
        <strong>${esc(data.customerName)}</strong><br/>
        <a href="mailto:${esc(data.customerEmail)}" style="color:#C9A84C;">${esc(data.customerEmail)}</a>
        ${data.customerPhone ? `<br/>Tél. : ${esc(data.customerPhone)}` : ''}
        ${data.paysResidence ? `<br/>Pays de résidence : ${esc(data.paysResidence)}` : ''}
      </p>
    </div>

    ${buildDeliveryBlock(data)}
    ${itemsTable(data.items)}

    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1A1209;margin:0 0 8px;">
      <strong>Total : ${data.total.toFixed(2)} €</strong>
      ${data.shippingCost === 0 ? ' (livraison offerte)' : ` (dont ${data.shippingCost.toFixed(2)} € de livraison)`}
    </p>

    ${
      data.notes
        ? `
    <div style="background:rgba(201,168,76,0.06);border-left:3px solid #C9A84C;padding:12px 16px;margin-bottom:20px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Message client</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1209;margin:0;">${esc(data.notes)}</p>
    </div>
    `
        : ''
    }

    <div style="text-align:center;margin:28px 0;">
      <a href="${SITE_URL}/admin" style="display:inline-block;background:#C9A84C;color:#1A1209;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:14px 28px;text-decoration:none;">
        Ouvrir le backoffice →
      </a>
    </div>
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.45);text-align:center;margin:0;">
      Onglet <strong>Commandes</strong> · recherchez <strong>${esc(data.orderNumber)}</strong>
    </p>
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
      Réf. <strong style="color:#C9A84C;">${esc(data.orderNumber)}</strong>
    </p>

    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:rgba(61,43,31,0.7);margin:0 0 20px;">
      Bonjour <strong>${esc(data.customerName)}</strong>,
    </p>

    <div style="background:rgba(201,168,76,0.06);border-left:4px solid #C9A84C;padding:20px 24px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C9A84C;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Statut</p>
      <p style="font-family:'Georgia',serif;font-size:20px;color:#1A1209;margin:0 0 10px;">${esc(label)}</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:rgba(61,43,31,0.65);line-height:1.7;margin:0;">${esc(description)}</p>
    </div>

    ${
      data.trackingNumber
        ? `
    <div style="background:rgba(61,43,31,0.03);border:1px solid rgba(61,43,31,0.08);padding:14px 18px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Suivi colis${data.carrier ? ` — ${esc(data.carrier)}` : ''}</p>
      <p style="font-family:'Georgia',serif;font-size:18px;color:#1A1209;margin:0 0 10px;letter-spacing:1px;">${esc(data.trackingNumber)}</p>
      ${data.trackingUrl ? `<p style="margin:0;"><a href="${esc(data.trackingUrl)}" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#C9A84C;text-decoration:none;border-bottom:1px solid #C9A84C;">Suivre le colis en ligne →</a></p>` : ''}
    </div>
    `
        : ''
    }

    ${
      data.notes
        ? `
    <div style="background:rgba(61,43,31,0.03);border:1px solid rgba(61,43,31,0.08);padding:14px 18px;margin-bottom:24px;">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:rgba(61,43,31,0.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Message</p>
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1A1209;margin:0;line-height:1.7;">${esc(data.notes)}</p>
    </div>
    `
        : ''
    }

    ${trackingInstructionsBlock(data.orderNumber)}
  `;
  return emailWrapper(content);
}

// ─── Envoi ───────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (isGmailConfigured()) {
    try {
      await sendGmailMessage({ to, subject, html });
      console.log(`[EMAIL] Envoyé via Gmail → ${to} | ${subject}`);
      return true;
    } catch (err) {
      console.error('[EMAIL] Erreur Gmail:', err);
      return false;
    }
  }

  console.log(`[EMAIL PREVIEW] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL PREVIEW] HTML length: ${html.length} chars`);
  return true;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  const paid = data.paymentConfirmed === true;
  const subject = paid
    ? `Merci pour votre achat — commande ${data.orderNumber} — ${SITE_NAME}`
    : `Commande ${data.orderNumber} — ${SITE_NAME}`;
  const html = buildOrderConfirmationHtml(data);
  return sendEmail(data.customerEmail, subject, html);
}

export async function sendAdminNewOrderEmail(data: OrderEmailData): Promise<boolean> {
  const paid = data.paymentConfirmed === true;
  const subject = paid
    ? `[${SITE_NAME}] Achat confirmé ${data.orderNumber} — ${data.total.toFixed(2)} €`
    : `[${SITE_NAME}] Commande en attente ${data.orderNumber} — ${data.total.toFixed(2)} €`;
  const html = buildAdminNewOrderHtml(data);
  return sendEmail(ADMIN_EMAIL, subject, html);
}

export async function sendOrderStatusUpdateEmail(data: StatusEmailData): Promise<boolean> {
  const label = STATUS_LABELS[data.newStatus] ?? data.newStatus;
  const subject = `Votre commande ${data.orderNumber} : ${label} — ${SITE_NAME}`;
  const html = buildStatusUpdateHtml(data);
  return sendEmail(data.customerEmail, subject, html);
}
