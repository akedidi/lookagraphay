'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import PriceDisplay from '@/components/PriceDisplay';

const gold = '#C9A84C';
const dark = '#1A1209';
const ivory = '#F5F0E8';

export default function CartDrawer() {
  const { items, removeItem, updateQty, totalItems, totalPrice, isOpen, setIsOpen } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,9,0.6)', zIndex: 300 }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: 420,
              background: dark, zIndex: 301,
              display: 'flex', flexDirection: 'column',
              borderLeft: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              <div>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: ivory, letterSpacing: '0.05em' }}>
                  Mon panier
                </span>
                {totalItems > 0 && (
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', color: gold, marginLeft: '0.75rem', letterSpacing: '0.15em' }}>
                    {totalItems} article{totalItems > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: ivory, fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '0.25rem' }}
                aria-label="Fermer le panier"
              >
                ×
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: gold, opacity: 0.3, marginBottom: '1rem' }}>◆</div>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', color: 'rgba(245,240,232,0.4)', letterSpacing: '0.1em' }}>
                    Votre panier est vide
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(201,168,76,0.08)' }}>
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.matiere}`}
                      style={{ background: '#2A2520', padding: '1rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}
                    >
                      {/* Thumbnail */}
                      <div style={{ width: 56, height: 56, flexShrink: 0, background: '#1A1209', overflow: 'hidden' }}>
                        {item.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.images[0]} alt={item.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: gold, opacity: 0.3 }}>ل</div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: ivory, marginBottom: '0.15rem', lineHeight: 1.2 }}>
                          {item.titre}
                        </p>
                        {item.matiere && (
                          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: gold, letterSpacing: '0.12em', marginBottom: '0.15rem' }}>
                            {item.matiere}{item.quantite_label ? ` · ${item.quantite_label}` : ''}
                          </p>
                        )}
                        <div style={{ marginBottom: '0.6rem' }}>
                          <PriceDisplay
                            original={item.prix_original ?? item.prix}
                            final={item.prix}
                            active={item.prix_original != null && item.prix < (item.prix_original ?? item.prix)}
                            size="sm"
                            light
                          />
                        </div>
                        {/* Qty controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => updateQty(item.id, item.qty - 1, item.matiere)}
                            style={{ width: 24, height: 24, border: '1px solid rgba(201,168,76,0.3)', background: 'none', color: ivory, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          >−</button>
                          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: ivory, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1, item.matiere)}
                            style={{ width: 24, height: 24, border: '1px solid rgba(201,168,76,0.3)', background: 'none', color: ivory, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          >+</button>
                          <button
                            onClick={() => removeItem(item.id, item.matiere)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(224,85,85,0.7)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.1em', padding: 0 }}
                          >Retirer</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.6)' }}>
                    Sous-total
                  </span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 300, color: gold }}>
                    {totalPrice.toFixed(2)} €
                  </span>
                </div>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: 'rgba(245,240,232,0.4)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  Frais de livraison calculés à l'étape suivante
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'block', textAlign: 'center',
                    fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem',
                    letterSpacing: '0.25em', textTransform: 'uppercase',
                    background: gold, color: dark,
                    padding: '1rem', textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Passer la commande
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'block', width: '100%', marginTop: '0.75rem',
                    fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    background: 'none', border: '1px solid rgba(201,168,76,0.25)',
                    color: 'rgba(245,240,232,0.5)', padding: '0.75rem', cursor: 'pointer',
                  }}
                >
                  Continuer les achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
