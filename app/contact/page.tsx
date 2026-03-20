'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

const motifs = [
  { value: 'atelier', label: 'Inscription à un atelier' },
  { value: 'achat', label: "Achat d'une œuvre" },
  { value: 'commande', label: 'Commande sur mesure' },
  { value: 'exposition', label: "Proposition d'exposition" },
  { value: 'collaboration', label: 'Collaboration / Partenariat' },
  { value: 'presse', label: 'Presse / Médias' },
  { value: 'autre', label: 'Autre demande' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', motif: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
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
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10rem 1.5rem 5rem', background: '#1A1209' }}
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
            initial="hidden"
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
                  Paris, 11e arrondissement
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
          </motion.div>

          {/* Formulaire */}
          <motion.div
            initial="hidden"
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
                    <label style={labelStyle}>Nom & Prénom</label>
                    <input
                      type="text"
                      name="nom"
                      required
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      style={inputStyle}
                    />
                  </div>
                  <div>
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
                    {motifs.map((m) => (
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

                <button type="submit" className="btn-gold btn-gold-solid" style={{ alignSelf: 'flex-start' }}>
                  Envoyer le message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
