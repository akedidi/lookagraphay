'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetchInit, adminJsonInit } from '@/lib/admin-fetch';

const gold = '#C9A84C';
const dark = '#1A1209';
const light = '#F5F0E8';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(245,240,232,0.08)',
  border: '1px solid rgba(201,168,76,0.25)',
  color: light,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.88rem',
  padding: '0.6rem 0.85rem',
  outline: 'none',
  borderRadius: 0,
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.68rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: gold,
  marginBottom: '0.35rem',
};

const btnGold: React.CSSProperties = {
  background: gold,
  color: dark,
  border: 'none',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.75rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  padding: '0.6rem 1.4rem',
  cursor: 'pointer',
  fontWeight: 500,
};

const btnOutline: React.CSSProperties = {
  background: 'transparent',
  color: gold,
  border: `1px solid ${gold}`,
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '0.45rem 1rem',
  cursor: 'pointer',
};

type Subscriber = {
  id: number;
  email: string;
  prenom: string | null;
  nom: string | null;
  active: boolean;
  source: string;
  subscribed_at: string;
};

type Campaign = {
  id: number;
  subject: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
};

export default function NewsletterPanel({ onFlash }: { onFlash: (m: string) => void }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  const [newNom, setNewNom] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, camps] = await Promise.all([
        fetch('/api/admin/newsletter/subscribers', adminFetchInit).then((r) => r.json()),
        fetch('/api/admin/newsletter/campaigns', adminFetchInit).then((r) => r.json()),
      ]);
      if (Array.isArray(subs)) setSubscribers(subs);
      if (Array.isArray(camps)) setCampaigns(camps);
    } catch {
      onFlash('❌ Erreur chargement newsletter');
    }
    setLoading(false);
  }, [onFlash]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeCount = subscribers.filter((s) => s.active).length;

  const filtered = subscribers.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.email.toLowerCase().includes(q) ||
      (s.prenom ?? '').toLowerCase().includes(q) ||
      (s.nom ?? '').toLowerCase().includes(q)
    );
  });

  async function toggleActive(id: number, active: boolean) {
    const res = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
      method: 'PATCH',
      ...adminJsonInit({ active }),
    });
    if (res.ok) {
      setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
      onFlash(active ? '✅ Abonnement activé' : '✅ Abonnement désactivé');
    } else {
      onFlash('❌ Erreur mise à jour');
    }
  }

  async function addSubscriber(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/newsletter/subscribers', {
      method: 'POST',
      ...adminJsonInit({ email: newEmail, prenom: newPrenom, nom: newNom, active: true }),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.subscribers)) {
      setSubscribers(data.subscribers);
      setNewEmail('');
      setNewPrenom('');
      setNewNom('');
      onFlash('✅ Abonné ajouté');
    } else {
      onFlash('❌ ' + (data.error || 'Erreur'));
    }
  }

  async function sendNewsletter(confirmed: boolean) {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        ...adminJsonInit({ subject, body, confirm: confirmed }),
      });
      const data = await res.json();

      if (data.preview && !confirmed) {
        const ok = confirm(
          `Envoyer cette newsletter à ${data.recipient_count} abonné(s) actif(s) ?\n\nObjet : ${subject}`
        );
        if (ok) {
          setSending(false);
          return sendNewsletter(true);
        }
        setSending(false);
        return;
      }

      if (!res.ok) {
        setSendResult(data.error || 'Erreur envoi');
        setSending(false);
        return;
      }

      setSendResult(`Envoyé : ${data.sent} · Échecs : ${data.failed}`);
      onFlash(`✅ Newsletter envoyée (${data.sent} destinataires)`);
      setSubject('');
      setBody('');
      fetchData();
    } catch {
      setSendResult('Erreur réseau');
    }
    setSending(false);
  }

  return (
    <div>
      <div className="admin-section-head" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: light }}>
          Newsletter
        </h2>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.5)' }}>
          {activeCount} abonné(s) actif(s) · {subscribers.length} au total
        </span>
      </div>

      <div className="admin-newsletter-grid">
        {/* Composer */}
        <div style={{ background: dark, border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '1.25rem' }}>
            Rédiger & envoyer
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Objet</label>
            <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex. Vernissage — printemps 2026" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Message</label>
            <textarea
              style={{ ...inputStyle, minHeight: 220, resize: 'vertical', lineHeight: 1.7 }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Votre texte… Les paragraphes séparés par une ligne vide seront mis en forme automatiquement."
            />
          </div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', color: 'rgba(245,240,232,0.45)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Chaque email inclut le design LookaGraphy et un lien de désinscription en bas de page.
            Compte <code style={{ color: gold }}>contact.lookagraphy</code> (<code style={{ color: gold }}>CONTACT_GMAIL_*</code>).
          </p>
          <button
            type="button"
            disabled={sending || !subject.trim() || !body.trim() || activeCount === 0}
            onClick={() => sendNewsletter(false)}
            style={{ ...btnGold, opacity: sending || activeCount === 0 ? 0.6 : 1 }}
          >
            {sending ? 'Envoi en cours…' : `Envoyer à ${activeCount} abonné(s)`}
          </button>
          {sendResult && (
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: gold, marginTop: '1rem' }}>{sendResult}</p>
          )}

          {campaigns.length > 0 && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
              <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Derniers envois</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {campaigns.slice(0, 5).map((c) => (
                  <li key={c.id} style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,232,0.6)', marginBottom: '0.5rem' }}>
                    {c.subject} — {c.sent_count} envoyés
                    {c.failed_count > 0 ? ` (${c.failed_count} échecs)` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Subscribers */}
        <div style={{ background: dark, border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>
            Abonnés
          </h3>

          <form onSubmit={addSubscriber} className="admin-form-grid" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
            <input style={inputStyle} type="email" required placeholder="Email *" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <input style={inputStyle} placeholder="Prénom" value={newPrenom} onChange={(e) => setNewPrenom(e.target.value)} />
            <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="Nom" value={newNom} onChange={(e) => setNewNom(e.target.value)} />
            <button type="submit" style={{ ...btnOutline, gridColumn: '1 / -1' }}>+ Ajouter manuellement</button>
          </form>

          <input
            style={{ ...inputStyle, marginBottom: '1rem' }}
            placeholder="Rechercher email, prénom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: '0.8rem' }}>Chargement…</p>
          ) : (
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {filtered.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.65rem 0',
                    borderBottom: '1px solid rgba(201,168,76,0.08)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: light, margin: 0, wordBreak: 'break-all' }}>
                      {s.email}
                    </p>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', color: 'rgba(245,240,232,0.45)', margin: '0.2rem 0 0' }}>
                      {[s.prenom, s.nom].filter(Boolean).join(' ') || '—'} · {s.source}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActive(s.id, !s.active)}
                    style={{
                      ...btnOutline,
                      flexShrink: 0,
                      fontSize: '0.65rem',
                      color: s.active ? '#6fcf97' : 'rgba(245,240,232,0.4)',
                      borderColor: s.active ? '#6fcf97' : 'rgba(245,240,232,0.25)',
                    }}
                  >
                    {s.active ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: 'rgba(245,240,232,0.45)' }}>Aucun abonné.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
