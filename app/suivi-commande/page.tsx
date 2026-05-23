'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const gold = '#C9A84C';
const dark = '#1A1209';
const ivory = '#F5F0E8';

const STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  en_attente: { label: 'En attente de paiement', color: '#E4C97A', desc: 'Votre commande a bien été enregistrée. En attente de confirmation de paiement.' },
  paye: { label: 'Paiement confirmé', color: '#6fcf97', desc: 'Votre paiement a été confirmé. Nous préparons votre commande.' },
  expedie: { label: 'Expédiée', color: '#56CCF2', desc: 'Votre commande a été expédiée. Consultez le numéro de suivi ci-dessous.' },
  livre: { label: 'Livrée', color: '#6fcf97', desc: 'Votre commande a été livrée. Merci pour votre confiance.' },
  annule: { label: 'Annulée', color: '#e05555', desc: 'Cette commande a été annulée. Contactez-nous pour plus d\'informations.' },
};

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

function SuiviCommandeForm() {
  const searchParams = useSearchParams();
  const autoLoaded = useRef(false);

  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async (num: string, mail: string) => {
    const n = num.trim().toUpperCase();
    const e = mail.trim();
    if (!n || !e) return;

    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(n)}?email=${encodeURIComponent(e)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Commande introuvable. Vérifiez le numéro et l\'email.');
      } else {
        setOrder(data);
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const o = searchParams.get('order') ?? '';
    const e = searchParams.get('email') ?? '';
    if (o) setOrderNumber(o);
    if (e) setEmail(e);
  }, [searchParams]);

  useEffect(() => {
    const o = (searchParams.get('order') ?? '').trim();
    const e = (searchParams.get('email') ?? '').trim();
    if (o && e && !autoLoaded.current) {
      autoLoaded.current = true;
      fetchOrder(o, e);
    }
  }, [searchParams, fetchOrder]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetchOrder(orderNumber, email);
  }

  const statusInfo = order ? (STATUS_LABELS[order.status] ?? { label: order.status, color: gold, desc: '' }) : null;

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <section style={{ background: dark, padding: '7rem 1.5rem 4rem', textAlign: 'center' }}>
        <div className="page-header-anim">
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.42em', textTransform: 'uppercase', color: gold, display: 'block', marginBottom: '1.25rem' }}>
            Suivi
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: ivory, letterSpacing: '0.06em' }}>
            Ma commande
          </h1>
          <span className="block mx-auto mt-6" style={{ width: 50, height: 1, background: gold }} />
        </div>
      </section>

      <section style={{ maxWidth: 560, margin: '0 auto', padding: '4rem 1.5rem 8rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Numéro de commande</label>
              <input
                type="text"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="LG-20260520-0001"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={labelStyle}>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={inputStyle}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1rem',
                fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem',
                letterSpacing: '0.25em', textTransform: 'uppercase',
                background: gold, color: dark, border: 'none', cursor: 'pointer', fontWeight: 500,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Recherche…' : 'Consulter ma commande'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', color: '#e05555' }}>
              {error}
            </div>
          )}

          {order && statusInfo && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginTop: '2.5rem' }}
            >
              <div style={{ background: dark, padding: '2rem', marginBottom: '1px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: statusInfo.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                </div>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: 'rgba(245,240,232,0.7)', lineHeight: 1.7 }}>
                  {statusInfo.desc}
                </p>
              </div>

              <div style={{ background: '#FAF7F2', padding: '2rem', border: '1px solid rgba(61,43,31,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, display: 'block', marginBottom: '0.2rem' }}>Commande</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: dark }}>{order.order_number}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, display: 'block', marginBottom: '0.2rem' }}>Date</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: dark }}>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgba(61,43,31,0.08)', marginBottom: '1.25rem' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {(order.items ?? []).map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: dark, flex: 1 }}>
                        {item.qty}× {item.titre}{item.matiere ? ` (${item.matiere})` : ''}
                      </span>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: gold, flexShrink: 0 }}>
                        {(item.prix * item.qty).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: 'rgba(61,43,31,0.08)', marginBottom: '1rem' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(61,43,31,0.55)' }}>
                    Livraison ({order.delivery_type === 'relay' ? 'Point Relais' : order.delivery_type === 'home' ? 'Domicile' : 'International'})
                  </span>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', color: dark }}>
                    {Number(order.shipping_cost) === 0 ? 'Offerte' : `${Number(order.shipping_cost).toFixed(2)} €`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: dark, fontWeight: 500 }}>
                    Total
                  </span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 400, color: gold }}>
                    {Number(order.total).toFixed(2)} €
                  </span>
                </div>

                {order.delivery_type === 'relay' && order.relay_point && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '0.35rem' }}>Point relais</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: dark, lineHeight: 1.7 }}>
                      {order.relay_point.nom}
                      {order.relay_point.adresse ? <><br />{order.relay_point.adresse}</> : null}
                      <br />{order.relay_point.code_postal} {order.relay_point.ville}
                      {order.relay_point.id ? <><br /><span style={{ opacity: 0.7 }}>ID : {order.relay_point.id}</span></> : null}
                    </p>
                  </div>
                )}

                {order.tracking_number && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '0.35rem' }}>
                      Suivi colis{order.carrier ? ` — ${order.carrier}` : ''}
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.15rem', color: dark, marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                      {order.tracking_number}
                    </p>
                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: gold, textDecoration: 'none', borderBottom: `1px solid ${gold}` }}
                      >
                        Suivre mon colis →
                      </a>
                    )}
                  </div>
                )}

                {order.delivery_type === 'home' && order.shipping_address && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '0.35rem' }}>Adresse de livraison</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', fontWeight: 300, color: dark, lineHeight: 1.7 }}>
                      {order.shipping_address.rue}
                      {order.shipping_address.complement ? <><br />{order.shipping_address.complement}</> : null}
                      <br />{order.shipping_address.code_postal} {order.shipping_address.ville}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '0.35rem' }}>Votre message</p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', fontWeight: 300, color: dark, lineHeight: 1.7 }}>
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
}

export default function SuiviCommandePage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', color: gold, textTransform: 'uppercase' }}>Chargement…</span>
        </div>
      }
    >
      <SuiviCommandeForm />
    </Suspense>
  );
}
