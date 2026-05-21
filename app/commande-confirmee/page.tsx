'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

const gold = '#C9A84C';
const dark = '#1A1209';
const ivory = '#F5F0E8';

function ConfirmationContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const total = params.get('total') ?? '';
  const paymentLink = params.get('payment_link') ?? '';

  // Fallback rétrocompatibilité ancien lien ?paypal=XX
  const legacyPaypal = params.get('paypal') ?? '';
  const resolvedPaymentLink = paymentLink || (legacyPaypal ? `https://paypal.me/lookagraphy/${legacyPaypal}` : '');
  const displayAmount = total || legacyPaypal || '';

  // Détecte le label selon le lien (PayPal, Stripe, autre)
  function paymentLabel(): string {
    if (!resolvedPaymentLink || resolvedPaymentLink.startsWith('#')) return '';
    if (resolvedPaymentLink.includes('paypal.me')) return 'Payer via PayPal';
    if (resolvedPaymentLink.includes('stripe.com')) return 'Payer par carte (Stripe)';
    if (resolvedPaymentLink.includes('sumup')) return 'Payer via SumUp';
    return 'Finaliser le paiement';
  }

  function paymentNote(): string {
    if (!resolvedPaymentLink || resolvedPaymentLink.startsWith('#')) return '';
    if (resolvedPaymentLink.includes('paypal.me')) return 'Vous serez redirigé vers PayPal pour finaliser le paiement en toute sécurité.';
    return 'Votre commande sera traitée dès réception de votre paiement.';
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: 560, width: '100%' }}
      >
        {/* En-tête confirmation */}
        <div style={{ background: dark, padding: '3rem 2.5rem', textAlign: 'center', marginBottom: '1px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: gold, marginBottom: '1rem', opacity: 0.8 }}>◆</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: '1.8rem', color: ivory, letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Commande confirmée
          </h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: 'rgba(245,240,232,0.65)', lineHeight: 1.8 }}>
            Merci pour votre commande. Voici votre numéro de référence :
          </p>
          <div style={{ margin: '1.5rem 0', padding: '0.85rem 1.5rem', border: '1px solid rgba(201,168,76,0.3)', display: 'inline-block' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: gold, letterSpacing: '0.1em' }}>
              {orderNumber}
            </span>
          </div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: 'rgba(245,240,232,0.5)', lineHeight: 1.8 }}>
            Conservez ce numéro pour suivre votre commande.
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', fontWeight: 300, color: 'rgba(245,240,232,0.35)', marginTop: '0.5rem', lineHeight: 1.7 }}>
            Un email de confirmation vous a été envoyé.
          </p>
        </div>

        {/* Bloc paiement */}
        {resolvedPaymentLink && !resolvedPaymentLink.startsWith('#') && (
          <div style={{ background: '#FAF7F2', padding: '2rem 2.5rem', border: '1px solid rgba(61,43,31,0.08)', marginBottom: '1px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, marginBottom: '0.75rem' }}>
              Finaliser le paiement
            </p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: dark, lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Votre commande sera traitée dès réception de votre paiement.
            </p>
            <a
              href={resolvedPaymentLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem',
                letterSpacing: '0.25em', textTransform: 'uppercase',
                background: gold, color: dark, padding: '1rem 2.5rem',
                textDecoration: 'none', fontWeight: 500,
              }}
            >
              {paymentLabel()}{displayAmount ? ` — ${Number(displayAmount).toFixed(2)} €` : ''}
            </a>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: 'rgba(61,43,31,0.45)', marginTop: '0.85rem', lineHeight: 1.6 }}>
              {paymentNote()}
            </p>
          </div>
        )}

        {/* Paiement automatique — placeholder futur (Stripe webhook, etc.) */}
        {resolvedPaymentLink.startsWith('#') && (
          <div style={{ background: '#FAF7F2', padding: '2rem 2.5rem', border: '1px solid rgba(61,43,31,0.08)', marginBottom: '1px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: 'rgba(61,43,31,0.55)', lineHeight: 1.8 }}>
              Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ background: '#FAF7F2', padding: '1.5rem 2.5rem', border: '1px solid rgba(61,43,31,0.08)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/suivi-commande"
            style={{
              flex: 1, display: 'block', textAlign: 'center',
              fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              border: `1px solid ${gold}`, color: gold,
              padding: '0.85rem 1rem', textDecoration: 'none',
            }}
          >
            Suivre ma commande
          </Link>
          <Link
            href="/store"
            style={{
              flex: 1, display: 'block', textAlign: 'center',
              fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              border: '1px solid rgba(61,43,31,0.15)', color: 'rgba(61,43,31,0.55)',
              padding: '0.85rem 1rem', textDecoration: 'none',
            }}
          >
            Continuer les achats
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CommandeConfirmeePage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
