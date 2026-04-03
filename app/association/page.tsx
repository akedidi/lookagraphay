'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
};

const pillars = [
  {
    num: '١',
    title: 'Éducation & Transmission',
    items: [
      'Ateliers réguliers de calligraphie pour tous niveaux — enfants, adultes, professionnels',
      'Stages de perfectionnement avec des maîtres calligraphes',
      'Enseignement des arts du livre : enluminure, reliure, composition de manuscrits',
    ],
  },
  {
    num: '٢',
    title: 'Événements & Expositions',
    items: [
      'Expositions de calligraphie contemporaine et traditionnelle',
      'Performances associant calligraphie et arts vivants — danse, musique, théâtre',
      'Festivals autour de la calligraphie et de la culture manuscrite',
    ],
  },
  {
    num: '٣',
    title: 'Création Interdisciplinaire',
    items: [
      'Projets artistiques hybrides : calligraphie et musique live, peinture et théâtre',
      'Collaborations entre calligraphes et artistes d\'autres disciplines',
      'Exploration du lien entre geste calligraphique et mouvement corporel',
    ],
  },
  {
    num: '٤',
    title: 'Patrimoine & Interculturalité',
    items: [
      'Sensibilisation au patrimoine de la calligraphie arabe et des traditions du monde',
      'Promotion du dialogue entre cultures à travers l\'art de l\'écriture',
      'Valorisation de la richesse linguistique et scripturale du monde arabe',
    ],
  },
  {
    num: '٥',
    title: 'Innovation & Numérique',
    items: [
      'Projets numériques et interactifs : réalité augmentée, projections',
      'Bibliothèque et base de données numériques d\'œuvres calligraphiées',
      'Recherche sur les outils, encres, papiers et supports modernes',
    ],
  },
  {
    num: '٦',
    title: 'Engagement Social & Inclusion',
    items: [
      'Ateliers pour personnes en situation de handicap et quartiers prioritaires',
      'Calligraphie comme moyen d\'expression dans des projets sociaux et thérapeutiques',
      'Participation des femmes et des publics éloignés de la culture',
    ],
  },
];

export default function AssociationPage() {
  return (
    <main style={{ background: '#1A1209', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(180deg, #0D0A05 0%, #1A1209 100%)',
          padding: '8rem 1.5rem 6rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold ornament line top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          {/* Gold ornament */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 60, height: 1, background: 'linear-gradient(to right, transparent, #C9A84C)' }} />
            <span style={{ color: '#C9A84C', fontSize: '1.1rem', opacity: 0.7 }}>◆</span>
            <div style={{ width: 60, height: 1, background: 'linear-gradient(to left, transparent, #C9A84C)' }} />
          </div>

          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '1.5rem',
            }}
          >
            Loi 1901 — Déclarée
          </span>

          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              color: '#F5F0E8',
              letterSpacing: '0.06em',
              lineHeight: 1.15,
              marginBottom: '1rem',
            }}
          >
            Association<br />
            <em>Look A Graphy</em>
          </h1>

          <div style={{ width: 60, height: 1, background: '#C9A84C', margin: '1.5rem auto' }} />

          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(0.82rem, 1.5vw, 0.95rem)',
              color: 'rgba(245,240,232,0.72)',
              letterSpacing: '0.08em',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.9,
            }}
          >
            Association française de calligraphie et arts amis<br />
            déclarée par application de la loi du 1<sup>er</sup> juillet 1901
            et du décret du 16 août 1901.
          </p>
        </motion.div>

        {/* Bottom gold line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }} />
      </section>

      {/* ── Mission ─────────────────────────────────────────── */}
      <section style={{ background: '#F5F0E8', padding: '5rem 1.5rem' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}
        >
          {/* Logo on ivory background */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-association.png"
              alt="LookaGraphy Association"
              style={{ width: 130, height: 130, objectFit: 'contain', opacity: 0.9 }}
            />
          </div>

          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '1.5rem',
            }}
          >
            Notre raison d'être
          </span>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: '#1A1209',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}
          >
            Promouvoir l'art,<br />
            <em>nourrir la dynamique culturelle française.</em>
          </h2>
          <div style={{ width: 50, height: 1, background: '#C9A84C', margin: '0 auto 2rem' }} />
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.88rem',
              lineHeight: 2,
              color: '#3D2B1F',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            Cette association a pour objet de promouvoir l'art et participer à la dynamique de l'activité culturelle française — en réunissant calligraphes, artistes et passionnés autour d'une vision commune : faire vivre et rayonner l'art de l'écriture sous toutes ses formes.
          </p>
        </motion.div>
      </section>

      {/* ── 6 Pillars ────────────────────────────────────────── */}
      <section style={{ background: '#100C06', padding: '5rem 1.5rem 6rem' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '1rem',
            }}
          >
            Nos axes d'action
          </span>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              color: '#F5F0E8',
              letterSpacing: '0.04em',
            }}
          >
            Six piliers,<br />
            <em>une même passion.</em>
          </h2>
        </motion.div>

        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5px',
            background: 'rgba(201,168,76,0.15)',
          }}
        >
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: (i % 3) * 0.1, ease: 'easeOut' as const } },
              }}
              style={{
                background: '#1A1209',
                padding: '2.5rem 2rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '2.5rem',
                  fontWeight: 300,
                  color: 'rgba(201,168,76,0.35)',
                  lineHeight: 1,
                  marginBottom: '1rem',
                  letterSpacing: '0.1em',
                }}
              >
                {pillar.num}
              </div>
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 400,
                  fontSize: '1.2rem',
                  color: '#F5F0E8',
                  letterSpacing: '0.04em',
                  marginBottom: '1.25rem',
                  lineHeight: 1.3,
                }}
              >
                {pillar.title}
              </h3>
              <div style={{ width: 30, height: 1, background: '#C9A84C', marginBottom: '1.25rem' }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {pillar.items.map((item, j) => (
                  <li
                    key={j}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ color: '#C9A84C', marginTop: '0.35rem', flexShrink: 0, fontSize: '0.55rem' }}>◆</span>
                    <span
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 300,
                        fontSize: '0.78rem',
                        lineHeight: 1.8,
                        color: 'rgba(245,240,232,0.72)',
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(180deg, #100C06 0%, #1A1209 100%)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '1.5rem',
            }}
          >
            Nous rejoindre
          </span>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              color: '#F5F0E8',
              letterSpacing: '0.04em',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Devenez membre<br />
            <em>de l'association.</em>
          </h2>
          <div style={{ width: 50, height: 1, background: '#C9A84C', margin: '1.5rem auto 2rem' }} />
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.85rem',
              color: 'rgba(245,240,232,0.65)',
              maxWidth: 480,
              margin: '0 auto 2.5rem',
              lineHeight: 1.9,
            }}
          >
            Rejoignez une communauté d'artistes, de passionnés et de curieux unis autour de la beauté du geste calligraphique.
          </p>
          <a
            href="/contact"
            className="btn-gold"
            style={{ display: 'inline-block' }}
          >
            Nous contacter
          </a>
        </motion.div>
      </section>

    </main>
  );
}
