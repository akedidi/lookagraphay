/** Lien vers la page suivi avec n° de commande et email préremplis. */

export function trackingPagePath(orderNumber: string, email: string): string {
  const params = new URLSearchParams();
  const order = orderNumber.trim();
  const mail = email.trim();
  if (order) params.set('order', order.toUpperCase());
  if (mail) params.set('email', mail);
  const q = params.toString();
  return `/suivi-commande${q ? `?${q}` : ''}`;
}

export function trackingPageUrl(orderNumber: string, email: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lookagraphy.fr').replace(/\/$/, '');
  return `${base}${trackingPagePath(orderNumber, email)}`;
}
