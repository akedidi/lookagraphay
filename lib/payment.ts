/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ABSTRACTION PAIEMENT — LookaGraphy
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Pour changer de fournisseur de paiement, il suffit de :
 *   1. Définir PAYMENT_PROVIDER dans les variables d'environnement
 *      ('paypal' | 'stripe' | 'sumup' | 'lydia' | 'custom')
 *   2. Compléter le bloc correspondant dans generatePaymentLink()
 *   3. Ajouter les clés API nécessaires dans les secrets Replit
 *
 * Actuellement : PayPal (liens paypal.me) — aucune API key requise.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PaymentProvider = 'paypal' | 'stripe' | 'sumup' | 'lydia' | 'custom';

export type PaymentLinkOptions = {
  amount: number;
  currency?: string;
  orderNumber: string;
  description?: string;
};

export type PaymentLinkResult = {
  url: string;
  provider: PaymentProvider;
  label: string;
};

/**
 * Génère un lien de paiement selon le fournisseur configuré.
 * Le résultat est affiché sur la page de confirmation de commande.
 */
export function generatePaymentLink(options: PaymentLinkOptions): PaymentLinkResult {
  const provider = (process.env.PAYMENT_PROVIDER ?? 'paypal') as PaymentProvider;
  const { amount, orderNumber } = options;
  const paypalEmail = process.env.PAYPAL_EMAIL ?? 'lookagraphy';

  switch (provider) {

    case 'paypal':
      return {
        url: `https://paypal.me/${paypalEmail}/${amount.toFixed(2)}`,
        provider: 'paypal',
        label: `Payer ${amount.toFixed(2)} € via PayPal`,
      };

    case 'stripe':
      // TODO: Créer un PaymentIntent via l'API Stripe
      // Nécessite : STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
      // Exemple : https://stripe.com/docs/api/payment_links
      return {
        url: `#stripe-not-configured`,
        provider: 'stripe',
        label: `Payer ${amount.toFixed(2)} € par carte`,
      };

    case 'sumup':
      // TODO: Intégrer SumUp Checkout API
      // Nécessite : SUMUP_API_KEY, SUMUP_MERCHANT_CODE
      return {
        url: `#sumup-not-configured`,
        provider: 'sumup',
        label: `Payer ${amount.toFixed(2)} € via SumUp`,
      };

    case 'lydia':
      // TODO: Intégrer Lydia Business
      // Nécessite : LYDIA_VENDOR_TOKEN
      return {
        url: `#lydia-not-configured`,
        provider: 'lydia',
        label: `Payer ${amount.toFixed(2)} € via Lydia`,
      };

    default:
      return {
        url: `https://paypal.me/${paypalEmail}/${amount.toFixed(2)}`,
        provider: 'paypal',
        label: `Payer ${amount.toFixed(2)} € via PayPal`,
      };
  }
}

/**
 * Retourne le nom lisible du fournisseur de paiement actif.
 */
export function getPaymentProviderName(): string {
  const map: Record<string, string> = {
    paypal: 'PayPal',
    stripe: 'Stripe',
    sumup: 'SumUp',
    lydia: 'Lydia',
    custom: 'Paiement personnalisé',
  };
  return map[process.env.PAYMENT_PROVIDER ?? 'paypal'] ?? 'PayPal';
}

/**
 * Indique si le paiement est traité automatiquement (webhook) ou manuellement.
 * À mettre à jour selon l'opérateur choisi.
 */
export function isAutoPayment(): boolean {
  const autoProviders: PaymentProvider[] = ['stripe', 'sumup'];
  return autoProviders.includes((process.env.PAYMENT_PROVIDER ?? 'paypal') as PaymentProvider);
}
