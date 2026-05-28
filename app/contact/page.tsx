'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/data';
import { CONTACT_MOTIFS } from '@/lib/contact-motifs';

import { fadeUp, motionViewport } from '@/lib/motion-variants';

export default function ContactPage() {
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', motif: '', message: '' });
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsletterForm, setNewsletterForm] = useState({ prenom: '', nom: '', email: '' });
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewsletterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (newsletterSent) setNewsletterSent(false);
    setNewsletterForm({ ...newsletterForm, [e.target.name]: e.target.value });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterError(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterForm),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNewsletterError(typeof data.error === 'string' ? data.error : "Impossible de s'inscrire.");
        return;
      }

      setNewsletterSent(true);
      setNewsletterForm({ prenom: '', nom: '', email: '' });
    } catch {
      setNewsletterError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, newsletter_opt_in: newsletterOptIn }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : "Impossible d'envoyer le message.");
        return;
      }

      setSent(true);
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(61,43,31,0.25)',
    padding: '0.75rem 0',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 300,
    color: '#1A1209',
    letterSpacing: '0.05em',
    outline: 'none',
    transition: 'border-color 0.3s',
  };

  const labelStyle = {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '0.85rem',
    letterSpacing: '0.35em',
    textTransform: 'uppercase' as const,
    color: '#C9A84C',
    display: 'block',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <section
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 1.5rem 4rem', background: '#1A1209' }}
      >
        <div className="page-header-anim">
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '1.5rem',
            }}
          >
            Écrire
          </span>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              color: '#F5F0E8',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
            }}
          >
            Contact
          </h1>
          <span
            className="block mx-auto mt-6"
            style={{ width: 60, height: 1, background: '#C9A84C' }}
          />
        </div>
      </section>

      {/* Formulaire */}
      <section className="py-24 section-pad" style={{ background: '#F5F0E8' }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16" style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto' }}>
          {/* Sidebar */}
          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-2 max-w-lg mx-auto lg:max-w-none lg:mx-0"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.5rem',
              }}
            >
              L'Atelier
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: '2rem',
                color: '#1A1209',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              Un message,<br />
              <em>une conversation.</em>
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '2rem' }} />

            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
                fontSize: '0.875rem',
                lineHeight: 1.9,
                color: '#3D2B1F',
                marginBottom: '2.5rem',
              }}
            >
              Looka répond personnellement à chaque message. Pour les inscriptions aux ateliers, les acquisitions ou toute question, n'hésitez pas à écrire.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span style={labelStyle}>Email</span>
                <a
                  href={`mailto:${siteConfig.email}`}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 300,
                    color: '#3D2B1F',
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                  }}
                >
                  {siteConfig.email}
                </a>
              </div>
              <div>
                <span style={labelStyle}>Téléphone — calligraphie</span>
                <a
                  href={`tel:${siteConfig.phoneCalligraphyTel}`}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 300,
                    color: '#3D2B1F',
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                  }}
                >
                  {siteConfig.phoneCalligraphy}
                </a>
              </div>
              <div>
                <span style={labelStyle}>Instagram</span>
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 300,
                    color: '#3D2B1F',
                    textDecoration: 'none',
                  }}
                >
                  @lookagraphy
                </a>
              </div>
              <div>
                <span style={labelStyle}>Atelier</span>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 300,
                    color: '#3D2B1F',
                  }}
                >
                  Paris, 14e arrondissement
                </span>
              </div>
            </div>

            {/* ornement */}
            <div
              className="mt-16"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '5rem',
                color: '#C9A84C',
                opacity: 0.1,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              ح
            </div>

            {/* Newsletter (bas colonne gauche) */}
            <div className="mt-10" style={{ maxWidth: 420 }}>
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.75rem',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  display: 'block',
                  marginBottom: '1rem',
                }}
              >
                Newsletter
              </span>
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.82rem',
                  lineHeight: 1.8,
                  color: '#3D2B1F',
                  marginBottom: '1.25rem',
                }}
              >
                Recevez les actualités de l&apos;atelier, expositions et nouveautés. Désinscription possible à tout moment.
              </p>

              {newsletterSent && (
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    color: '#0E6B3E',
                    lineHeight: 1.7,
                    marginBottom: '1rem',
                  }}
                >
                  Merci. Votre inscription est confirmée.
                </p>
              )}
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    required
                    autoComplete="given-name"
                    value={newsletterForm.prenom}
                    onChange={handleNewsletterChange}
                    placeholder="Marie"
                    style={{ ...inputStyle, padding: '0.6rem 0', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Nom</label>
                  <input
                    type="text"
                    name="nom"
                    required
                    autoComplete="family-name"
                    value={newsletterForm.nom}
                    onChange={handleNewsletterChange}
                    placeholder="Dupont"
                    style={{ ...inputStyle, padding: '0.6rem 0', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newsletterForm.email}
                    onChange={handleNewsletterChange}
                    placeholder="votre@email.fr"
                    style={{ ...inputStyle, padding: '0.6rem 0', fontSize: '0.85rem' }}
                  />
                </div>

                {newsletterError && (
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: 300,
                      color: '#8B3A3A',
                      lineHeight: 1.6,
                    }}
                  >
                    {newsletterError}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-gold btn-gold-solid"
                  style={{ alignSelf: 'flex-start', padding: '0.7rem 1.1rem', fontSize: '0.8rem' }}
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? 'Inscription…' : "S'inscrire"}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Formulaire */}
          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-3"
          >
            {sent ? (
              <div
                className="flex flex-col items-center justify-center text-center"
                style={{ minHeight: 400 }}
              >
                <div className="ornament mb-6" style={{ fontSize: '2rem' }}>◆</div>
                <h2
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 300,
                    fontSize: '2rem',
                    color: '#1A1209',
                    marginBottom: '1rem',
                  }}
                >
                  Message envoyé
                </h2>
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 300,
                    fontSize: '0.875rem',
                    color: '#3D2B1F',
                    lineHeight: 1.7,
                  }}
                >
                  Looka vous répondra dans les meilleurs délais.<br />
                  Merci pour votre message.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                  <div>
                    <label style={labelStyle}>Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      required
                      autoComplete="given-name"
                      value={form.prenom}
                      onChange={handleChange}
                      placeholder="Marie"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Nom</label>
                    <input
                      type="text"
                      name="nom"
                      required
                      autoComplete="family-name"
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Dupont"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="votre@email.fr"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Motif de la demande</label>
                  <select
                    name="motif"
                    required
                    value={form.motif}
                    onChange={handleChange}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Choisir un motif</option>
                    {CONTACT_MOTIFS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Votre message</label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Dites-nous ce qui vous amène..."
                    style={{
                      ...inputStyle,
                      resize: 'none',
                      lineHeight: 1.8,
                    }}
                  />
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: 300,
                    color: 'rgba(61,43,31,0.75)',
                    lineHeight: 1.65,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    style={{ width: 16, height: 16, marginTop: 3, accentColor: '#C9A84C', flexShrink: 0 }}
                  />
                  <span>
                    Je souhaite recevoir la lettre d&apos;information LookaGraphy&nbsp;: actualités de
                    l&apos;atelier, expositions et nouveautés. Désinscription possible à tout moment.
                  </span>
                </label>

                {error && (
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.875rem',
                      fontWeight: 300,
                      color: '#8B3A3A',
                      lineHeight: 1.6,
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-gold btn-gold-solid"
                  style={{ alignSelf: 'flex-start' }}
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours…' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
