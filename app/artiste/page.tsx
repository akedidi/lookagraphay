'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { artistData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

export default function ArtistePage() {
  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Page header */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-20"
        style={{ background: '#1A1209' }}
      >
        <div className="page-header-anim">
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
            Portrait
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
            L'Artiste
          </h1>
          <span
            className="block mx-auto"
            style={{ width: 60, height: 1, background: '#C9A84C', marginBottom: '1.5rem' }}
          />
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'rgba(245,240,232,0.6)',
              letterSpacing: '0.04em',
            }}
          >
            {artistData.fullName}
          </p>
        </div>
      </section>

      {/* Bio + portrait */}
      <section className="py-24 px-6" style={{ background: '#F5F0E8' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
          {/* Portrait placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-2"
            style={{
              aspectRatio: '3/4',
              background: 'linear-gradient(135deg, #3D2B1F 0%, #1A1209 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '8rem',
                color: '#C9A84C',
                opacity: 0.2,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              ل
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                right: '1.5rem',
              }}
            >
              <div style={{ width: 30, height: 1, background: '#C9A84C', marginBottom: '0.75rem', opacity: 0.5 }} />
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.3)',
                }}
              >
                Luca — Calligraphe
              </p>
            </div>
          </motion.div>

          {/* Biographie */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="lg:col-span-3"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.5rem',
              }}
            >
              Biographie
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                color: '#1A1209',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: '2rem',
              }}
            >
              Entre deux rives,<br />
              <em>un seul geste.</em>
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '2rem' }} />

            {artistData.bio.map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.82rem',
                  lineHeight: 1.9,
                  color: '#3D2B1F',
                  marginBottom: '1.5rem',
                }}
              >
                {para}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Citation centrale */}
      <section className="py-24 px-6 text-center" style={{ background: '#2A2520' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="ornament mb-8" style={{ fontSize: '1.5rem' }}>ـ ـ ـ</div>
          <blockquote
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.3rem, 3vw, 2.2rem)',
              color: '#F5F0E8',
              lineHeight: 1.6,
              maxWidth: 680,
              margin: '0 auto 2rem',
              letterSpacing: '0.04em',
            }}
          >
            "{artistData.quote}"
          </blockquote>
          <cite
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              fontStyle: 'normal',
            }}
          >
            — Luca
          </cite>
        </motion.div>
      </section>

      {/* Démarche */}
      <section className="py-24 px-6" style={{ background: '#F5F0E8' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.5rem',
              }}
            >
              Démarche
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                color: '#1A1209',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              Le geste comme<br />
              <em>méditation</em>
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '1.5rem' }} />
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
                fontSize: '0.82rem',
                lineHeight: 1.9,
                color: '#3D2B1F',
              }}
            >
              La démarche de Luca est à la fois spirituelle et sensible. Chaque session de création commence par un temps de silence, d'attention au souffle, avant que le calame ne touche le papier. Elle explore les espaces entre tradition et contemporanéité, entre l'Orient qui l'a formée et l'Occident où elle crée.
            </p>
          </motion.div>

          {/* Inspirations */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.5rem',
              }}
            >
              Inspirations
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                color: '#1A1209',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              Ce qui nourrit<br />
              <em>le geste</em>
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '1.5rem' }} />
            <ul className="flex flex-col gap-4">
              {artistData.inspirations.map((insp, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <span style={{ color: '#C9A84C', fontSize: '0.7rem' }}>◆</span>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 300,
                      fontSize: '0.8rem',
                      color: '#3D2B1F',
                      lineHeight: 1.5,
                    }}
                  >
                    {insp}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ background: '#3D2B1F' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '1.2rem',
              color: 'rgba(245,240,232,0.7)',
              marginBottom: '2rem',
            }}
          >
            Découvrir les ateliers ou les œuvres de Luca
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ateliers" className="btn-gold">Ateliers</Link>
            <Link href="/galerie" className="btn-gold">Galerie</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
