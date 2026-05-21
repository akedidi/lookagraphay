'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart, calcShipping } from '@/lib/cart';
import Link from 'next/link';

const gold = '#C9A84C';
const dark = '#1A1209';
const ivory = '#F5F0E8';
const sand = '#F5F0E8';

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.88rem',
  padding: '0.85rem 1rem',
  border: '1px solid rgba(61,43,31,0.2)',
  background: '#FAF7F2',
  color: dark,
  outline: 'none',
  borderRadius: 0,
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.68rem',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: gold,
  marginBottom: '0.4rem',
};

const RELAY_COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'ES', label: 'Espagne' },
  { code: 'PT', label: 'Portugal' },
  { code: 'DE', label: 'Allemagne' },
];

type DeliveryType = 'relay' | 'home' | 'international' | '';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalWeight, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('');
  const [relayCountry, setRelayCountry] = useState('FR');
  const [relayPoint, setRelayPoint] = useState({ id: '', nom: '', adresse: '', ville: '', code_postal: '' });
  const [address, setAddress] = useState({ rue: '', complement: '', code_postal: '', ville: '' });
  const [customer, setCustomer] = useState({ nom: '', email: '', telephone: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div style={{ background: sand, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3rem', color: gold, opacity: 0.3, marginBottom: '1rem' }}>◆</div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: dark, marginBottom: '1.5rem' }}>Votre panier est vide</p>
          <Link href="/store" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: dark, background: gold, padding: '0.85rem 2rem', textDecoration: 'none' }}>
            Retour au store
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = deliveryType === 'relay'
    ? calcShipping(totalWeight, 'relay', relayCountry)
    : deliveryType === 'home'
    ? calcShipping(totalWeight, 'home', 'FR')
    : null;

  const orderTotal = shippingCost !== null ? totalPrice + shippingCost : totalPrice;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!deliveryType) e.delivery = 'Veuillez choisir un mode de livraison.';
    if (deliveryType === 'relay') {
      if (!relayPoint.nom.trim()) e.relay_nom = 'Nom du point relais requis.';
      if (!relayPoint.ville.trim()) e.relay_ville = 'Ville requise.';
    }
    if (deliveryType === 'home') {
      if (!address.rue.trim()) e.rue = 'Adresse requise.';
      if (!address.code_postal.trim()) e.code_postal = 'Code postal requis.';
      if (!address.ville.trim()) e.ville = 'Ville requise.';
    }
    if (!customer.nom.trim()) e.nom = 'Nom requis.';
    if (!customer.email.trim() || !customer.email.includes('@')) e.email = 'Email valide requis.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const body = {
        nom: customer.nom,
        email: customer.email,
        telephone: customer.telephone || null,
        items: items.map(i => ({ id: i.id, titre: i.titre, prix: i.prix, qty: i.qty, categorie: i.categorie, matiere: i.matiere, quantite_label: i.quantite_label })),
        delivery_type: deliveryType,
        relay_point: deliveryType === 'relay' ? relayPoint : null,
        shipping_address: deliveryType === 'home' ? address : null,
        pays: deliveryType === 'relay' ? relayCountry : 'FR',
        shipping_cost: shippingCost ?? 0,
        total: orderTotal,
        notes: notes || null,
      };
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la commande');
      clearCart();
      router.push(`/commande-confirmee?order=${data.order_number}&paypal=${orderTotal.toFixed(2)}`);
    } catch (err: any) {
      setErrors({ submit: err.message });
      setLoading(false);
    }
  }

  const sectionTitle = (label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 400, color: dark }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'rgba(61,43,31,0.1)' }} />
    </div>
  );

  const deliveryCard = (type: DeliveryType, icon: string, title: string, subtitle: string) => (
    <button
      type="button"
      onClick={() => setDeliveryType(type)}
      style={{
        flex: '1 1 200px', padding: '1.5rem', textAlign: 'left', cursor: 'pointer',
        border: `2px solid ${deliveryType === type ? gold : 'rgba(61,43,31,0.12)'}`,
        background: deliveryType === type ? 'rgba(201,168,76,0.05)' : '#FAF7F2',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: dark, marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', fontWeight: 300, color: 'rgba(61,43,31,0.55)', lineHeight: 1.5 }}>{subtitle}</div>
    </button>
  );

  return (
    <div style={{ background: sand, minHeight: '100vh', paddingTop: '80px' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: gold }}>
            Finaliser votre commande
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: dark, marginTop: '0.5rem' }}>
            Récapitulatif & livraison
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(360px, 100%)', gap: '2rem', alignItems: 'start' }}>

            {/* Left col — form */}
            <div>

              {/* Section 1 — Cart summary */}
              <div style={{ background: '#FAF7F2', padding: '2rem', marginBottom: '1.5rem', border: '1px solid rgba(61,43,31,0.08)' }}>
                {sectionTitle('Votre panier')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(61,43,31,0.06)', marginBottom: '1rem' }}>
                  {items.map(item => (
                    <div key={`${item.id}-${item.matiere}`} style={{ background: '#FAF7F2', padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {item.images?.[0] && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.images[0]} alt={item.titre} style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: dark }}>{item.qty}× {item.titre}</p>
                        {item.matiere && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: gold }}>{item.matiere}{item.quantite_label ? ` · ${item.quantite_label}` : ''}</p>}
                      </div>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: gold, flexShrink: 0 }}>{(item.prix * item.qty).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <Link href="/store" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(61,43,31,0.45)', textDecoration: 'none' }}>
                  ← Modifier le panier
                </Link>
              </div>

              {/* Section 2 — Delivery */}
              <div style={{ background: '#FAF7F2', padding: '2rem', marginBottom: '1.5rem', border: '1px solid rgba(61,43,31,0.08)' }}>
                {sectionTitle('Mode de livraison')}

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: errors.delivery ? '0.5rem' : '1.5rem' }}>
                  {deliveryCard('relay', '📍', 'Point Relais Mondial Relay', 'Gratuit — France, Belgique, Luxembourg, Espagne, Portugal, Allemagne')}
                  {deliveryCard('home', '🏠', 'Livraison à domicile', 'France uniquement — à partir de 10 €')}
                  {deliveryCard('international', '🌍', 'International', 'Devis personnalisé sur demande')}
                </div>
                {errors.delivery && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: '#e05555', marginBottom: '1rem' }}>{errors.delivery}</p>}

                {/* Relay details */}
                {deliveryType === 'relay' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', marginBottom: '1.25rem' }}>
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', fontWeight: 300, color: 'rgba(61,43,31,0.65)', lineHeight: 1.7, marginBottom: '0.85rem' }}>
                        Livraison gratuite en locker ou point relais Mondial Relay dans les pays éligibles.
                      </p>
                      <a
                        href="https://www.mondialrelay.fr/trouver-un-point-relais/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: gold, textDecoration: 'none', borderBottom: `1px solid ${gold}`, paddingBottom: '1px' }}
                      >
                        Trouver mon point relais →
                      </a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem', marginBottom: '1rem' }}>
                      <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
                        <label style={labelStyle}>Pays de livraison</label>
                        <select
                          value={relayCountry}
                          onChange={e => setRelayCountry(e.target.value)}
                          style={{ ...inputStyle }}
                        >
                          {RELAY_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
                        <label style={labelStyle}>Nom du point relais *</label>
                        <input style={{ ...inputStyle, borderColor: errors.relay_nom ? '#e05555' : 'rgba(61,43,31,0.2)' }} value={relayPoint.nom} onChange={e => setRelayPoint({ ...relayPoint, nom: e.target.value })} placeholder="Ex : Tabac du Centre" />
                        {errors.relay_nom && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#e05555', marginTop: '0.25rem' }}>{errors.relay_nom}</p>}
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Identifiant point relais</label>
                        <input style={inputStyle} value={relayPoint.id} onChange={e => setRelayPoint({ ...relayPoint, id: e.target.value })} placeholder="Ex : 123456" />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Code postal *</label>
                        <input style={inputStyle} value={relayPoint.code_postal} onChange={e => setRelayPoint({ ...relayPoint, code_postal: e.target.value })} placeholder="75001" />
                      </div>
                      <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
                        <label style={labelStyle}>Adresse du point relais</label>
                        <input style={inputStyle} value={relayPoint.adresse} onChange={e => setRelayPoint({ ...relayPoint, adresse: e.target.value })} placeholder="Ex : 12 rue de la Paix" />
                      </div>
                      <div style={{ gridColumn: '1/-1' }}>
                        <label style={labelStyle}>Ville *</label>
                        <input style={{ ...inputStyle, borderColor: errors.relay_ville ? '#e05555' : 'rgba(61,43,31,0.2)' }} value={relayPoint.ville} onChange={e => setRelayPoint({ ...relayPoint, ville: e.target.value })} placeholder="Paris" />
                        {errors.relay_ville && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#e05555', marginTop: '0.25rem' }}>{errors.relay_ville}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Home delivery details */}
                {deliveryType === 'home' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div style={{ padding: '1rem 1.25rem', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', marginBottom: '1.25rem' }}>
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', fontWeight: 300, color: 'rgba(61,43,31,0.65)', lineHeight: 1.7, marginBottom: '0.5rem' }}>Tarifs indicatifs selon le poids estimé du colis :</p>
                      {[['≤ 1 kg', '10 €'], ['≤ 5 kg', '15 €'], ['≤ 10 kg', '25 €'], ['≤ 30 kg', '40 €']].map(([w, p]) => (
                        <div key={w} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', color: 'rgba(61,43,31,0.6)', marginBottom: '0.2rem' }}>
                          <span>{w}</span><span style={{ color: gold }}>{p}</span>
                        </div>
                      ))}
                      {shippingCost !== null && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(201,168,76,0.15)', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: dark }}>Votre frais de port</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: gold }}>{shippingCost} €</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                      <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
                        <label style={labelStyle}>Adresse *</label>
                        <input style={{ ...inputStyle, borderColor: errors.rue ? '#e05555' : 'rgba(61,43,31,0.2)' }} value={address.rue} onChange={e => setAddress({ ...address, rue: e.target.value })} placeholder="12 rue de la Paix" />
                        {errors.rue && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#e05555', marginTop: '0.25rem' }}>{errors.rue}</p>}
                      </div>
                      <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
                        <label style={labelStyle}>Complément</label>
                        <input style={inputStyle} value={address.complement} onChange={e => setAddress({ ...address, complement: e.target.value })} placeholder="Bât. A, Apt. 3..." />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Code postal *</label>
                        <input style={{ ...inputStyle, borderColor: errors.code_postal ? '#e05555' : 'rgba(61,43,31,0.2)' }} value={address.code_postal} onChange={e => setAddress({ ...address, code_postal: e.target.value })} placeholder="75001" />
                        {errors.code_postal && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#e05555', marginTop: '0.25rem' }}>{errors.code_postal}</p>}
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Ville *</label>
                        <input style={{ ...inputStyle, borderColor: errors.ville ? '#e05555' : 'rgba(61,43,31,0.2)' }} value={address.ville} onChange={e => setAddress({ ...address, ville: e.target.value })} placeholder="Paris" />
                        {errors.ville && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#e05555', marginTop: '0.25rem' }}>{errors.ville}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* International */}
                {deliveryType === 'international' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)' }}>
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: 'rgba(61,43,31,0.7)', lineHeight: 1.8, marginBottom: '1rem' }}>
                        Pour les envois internationaux, nous vous proposons un devis personnalisé en fonction de votre destination et du poids de votre commande.
                      </p>
                      <a href="/contact" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: gold, textDecoration: 'none', borderBottom: `1px solid ${gold}`, paddingBottom: '1px' }}>
                        Nous contacter pour un devis →
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Section 3 — Customer info */}
              <div style={{ background: '#FAF7F2', padding: '2rem', marginBottom: '1.5rem', border: '1px solid rgba(61,43,31,0.08)' }}>
                {sectionTitle('Vos coordonnées')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
                    <label style={labelStyle}>Nom complet *</label>
                    <input style={{ ...inputStyle, borderColor: errors.nom ? '#e05555' : 'rgba(61,43,31,0.2)' }} value={customer.nom} onChange={e => setCustomer({ ...customer, nom: e.target.value })} placeholder="Votre nom et prénom" />
                    {errors.nom && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#e05555', marginTop: '0.25rem' }}>{errors.nom}</p>}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" style={{ ...inputStyle, borderColor: errors.email ? '#e05555' : 'rgba(61,43,31,0.2)' }} value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} placeholder="votre@email.com" />
                    {errors.email && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#e05555', marginTop: '0.25rem' }}>{errors.email}</p>}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Téléphone</label>
                    <input type="tel" style={inputStyle} value={customer.telephone} onChange={e => setCustomer({ ...customer, telephone: e.target.value })} placeholder="+33 6 00 00 00 00" />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Notes / message</label>
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instructions particulières, message pour le vendeur…" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right col — order summary */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: dark, padding: '2rem' }}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: gold, marginBottom: '1.5rem' }}>
                  Résumé
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {items.map(item => (
                    <div key={`${item.id}-${item.matiere}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', color: 'rgba(245,240,232,0.8)', flex: 1 }}>
                        {item.qty}× {item.titre}
                      </span>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', color: gold, flexShrink: 0 }}>
                        {(item.prix * item.qty).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: 'rgba(201,168,76,0.15)', marginBottom: '1rem' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.1em' }}>Sous-total</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: ivory }}>{totalPrice.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.1em' }}>Livraison</span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: shippingCost === 0 ? '#6fcf97' : ivory }}>
                    {deliveryType === '' ? '—' : deliveryType === 'international' ? 'Sur devis' : shippingCost === 0 ? 'Offerte' : shippingCost !== null ? `${shippingCost} €` : '—'}
                  </span>
                </div>

                <div style={{ height: 1, background: 'rgba(201,168,76,0.15)', marginBottom: '1.25rem' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: ivory, fontWeight: 500 }}>Total</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', fontWeight: 300, color: gold }}>
                    {deliveryType && deliveryType !== 'international' && shippingCost !== null ? orderTotal.toFixed(2) : totalPrice.toFixed(2)} €
                  </span>
                </div>

                {errors.submit && (
                  <div style={{ padding: '0.75rem', background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)', marginBottom: '1rem' }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: '#e05555' }}>{errors.submit}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || deliveryType === 'international'}
                  style={{
                    width: '100%', padding: '1rem',
                    fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem',
                    letterSpacing: '0.25em', textTransform: 'uppercase',
                    background: deliveryType === 'international' ? 'rgba(201,168,76,0.3)' : gold,
                    color: dark, border: 'none', cursor: deliveryType === 'international' ? 'not-allowed' : 'pointer',
                    fontWeight: 500, opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Traitement…' : deliveryType === 'international' ? 'Contactez-nous' : 'Confirmer la commande'}
                </button>

                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', color: 'rgba(245,240,232,0.35)', textAlign: 'center', marginTop: '0.85rem', lineHeight: 1.6 }}>
                  Paiement sécurisé via PayPal à l'étape suivante
                </p>
              </div>

              {/* Shipping info */}
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', padding: '1rem 1.25rem', marginTop: '1px' }}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: 'rgba(61,43,31,0.6)', lineHeight: 1.7 }}>
                  📍 Livraison gratuite en points relais Mondial Relay (FR, BE, LU, ES, PT, DE)<br />
                  🏠 Livraison à domicile en France à partir de 10 €<br />
                  🌍 International : contactez-nous pour un devis
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
