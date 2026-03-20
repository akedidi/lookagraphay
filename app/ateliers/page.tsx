'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ateliersData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

export default function AteliersPage() {
  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-20"
        style={{ background: '#2A2520' }}
      >
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '1.5rem',
            }}
          >
            Transmission & Pratique
          </span>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: '#F5F0E8',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Ateliers & Cours
          </h1>
          <span
            className="block mx-auto"
            style={{ width: 60, height: 1, background: '#C9A84C', marginBottom: '1.5rem' }}
          />
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.8rem',
              lineHeight: 1.8,
              color: 'rgba(245,240,232,0.55)',
              maxWidth: 520,
              margin: '0 auto',
            }}
          >
            Des cours semestriels en petits groupes pour entrer dans la pratique calligraphique avec profondeur, patience et présence.
          </p>
        </motion.div>
      </section>

      {/* Intro */}
      <section className="py-16 px-6" style={{ background: '#F5F0E8' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            { label: 'Petits groupes', value: '6 à 10', desc: 'places par session' },
            { label: 'Durée', value: '3h', desc: 'par séance' },
            { label: 'Lieu', value: 'Paris 11e', desc: 'Atelier LucaGraphy' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
            >
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  marginBottom: '0.5rem',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '2.5rem',
                  fontWeight: 300,
                  color: '#1A1209',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.65rem',
                  color: '#3D2B1F',
                  opacity: 0.6,
                }}
              >
                {item.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ateliers list */}
      <section className="py-16 px-6 pb-32" style={{ background: '#F5F0E8' }}>
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {ateliersData.map((atelier, i) => (
            <motion.article
              key={atelier.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              style={{
                border: '1px solid rgba(61,43,31,0.15)',
                background: '#FAF7F2',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '2.5rem',
                  borderBottom: '1px solid rgba(61,43,31,0.08)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1.5rem',
                  alignItems: 'start',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.55rem',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                      display: 'block',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {atelier.semestre} · {atelier.niveau}
                  </span>
                  <h2
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 400,
                      fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                      color: '#1A1209',
                      letterSpacing: '0.03em',
                      lineHeight: 1.2,
                    }}
                  >
                    {atelier.titre}
                  </h2>
                </div>
                <div className="text-right">
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '2rem',
                      fontWeight: 300,
                      color: '#C9A84C',
                      lineHeight: 1,
                    }}
                  >
                    {atelier.prix} €
                  </div>
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.55rem',
                      letterSpacing: '0.2em',
                      color:
                        atelier.placesRestantes <= 2
                          ? '#C9A84C'
                          : 'rgba(61,43,31,0.5)',
                      textTransform: 'uppercase',
                      marginTop: '0.25rem',
                    }}
                  >
                    {atelier.placesRestantes === 0
                      ? 'Complet'
                      : `${atelier.placesRestantes} place${atelier.placesRestantes > 1 ? 's' : ''} restante${atelier.placesRestantes > 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Infos pratiques */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {[
                    { label: 'Dates', value: atelier.dates },
                    { label: 'Horaires', value: atelier.horaires },
                    { label: 'Lieu', value: atelier.lieu },
                    { label: 'Places', value: `${atelier.places} au total` },
                    { label: 'Matériel', value: atelier.materiel },
                  ].map((info) => (
                    <div key={info.label}>
                      <span
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.55rem',
                          letterSpacing: '0.3em',
                          textTransform: 'uppercase',
                          color: '#C9A84C',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {info.label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.75rem',
                          fontWeight: 300,
                          color: '#3D2B1F',
                          lineHeight: 1.5,
                        }}
                      >
                        {info.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Description + Programme */}
                <div className="lg:col-span-3">
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      lineHeight: 1.9,
                      color: '#3D2B1F',
                      marginBottom: '2rem',
                    }}
                  >
                    {atelier.description}
                  </p>

                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.55rem',
                      letterSpacing: '0.35em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                      display: 'block',
                      marginBottom: '1rem',
                    }}
                  >
                    Programme
                  </span>
                  <ul className="flex flex-col gap-2 mb-8">
                    {atelier.programme.map((item, j) => (
                      <li
                        key={j}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.75rem',
                          fontWeight: 300,
                          color: '#3D2B1F',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: '#C9A84C', marginTop: '2px', flexShrink: 0 }}>◆</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* CTA PayPal */}
                  <a
                    href={atelier.paypalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold btn-gold-solid"
                    style={{ display: 'inline-block' }}
                  >
                    Réserver / Payer via PayPal
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FAQ rapide */}
      <section className="py-20 px-6" style={{ background: '#1A1209' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: '2rem',
                color: '#F5F0E8',
                letterSpacing: '0.05em',
              }}
            >
              Questions pratiques
            </h2>
            <span className="gold-line" />
          </motion.div>
          {[
            {
              q: 'Faut-il des connaissances en arabe ?',
              r: "Aucune ! La calligraphie arabe est un art visuel. Vous n'avez pas besoin de lire ou parler arabe pour pratiquer.",
            },
            {
              q: 'Le matériel est-il fourni ?',
              r: "Pour les ateliers de fondation, le matériel est inclus les premières séances. Une liste vous sera fournie à l'inscription.",
            },
            {
              q: "Comment s'inscrire ?",
              r: "Cliquez sur 'Réserver via PayPal' pour sécuriser votre place. Vous pouvez aussi écrire via le formulaire de contact.",
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                borderTop: '1px solid rgba(201,168,76,0.12)',
                padding: '1.5rem 0',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.1rem',
                  color: '#F5F0E8',
                  marginBottom: '0.75rem',
                  letterSpacing: '0.02em',
                }}
              >
                {faq.q}
              </h3>
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 300,
                  color: 'rgba(245,240,232,0.5)',
                  lineHeight: 1.7,
                }}
              >
                {faq.r}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
