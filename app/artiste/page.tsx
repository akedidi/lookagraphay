'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { artistData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

export default function ArtistePage() {
  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Page header */}
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
            Portrait
          </span>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
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
      <section className="py-24 section-pad" style={{ background: '#F5F0E8' }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start" style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto' }}>
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
                  fontSize: '0.85rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.7)',
                }}
              >
                Looka — Calligraphe
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
                fontSize: '0.75rem',
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
              Entre Orient et Occident,<br />
              <em>une écriture unique.</em>
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
      <section className="py-24 section-pad text-center" style={{ background: '#2A2520' }}>
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
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              fontStyle: 'normal',
            }}
          >
            — Looka
          </cite>
        </motion.div>
      </section>

      {/* Démarche */}
      <section className="py-24 section-pad" style={{ background: '#F5F0E8' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16" style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
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
              Un style<br />
              <em>distinctif et personnel</em>
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
              Dans un audacieux défi artistique, Looka présente les lettres arabes de haut en bas, à la manière des caractères japonais. Elle mêle des formes classiques à ses propres créations de lettres originales, forgiant un langage calligraphique qui célèbre la rencontre entre les civilisations — une ode à l'universalité humaine.
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
                fontSize: '0.75rem',
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
                  <span style={{ color: '#C9A84C', fontSize: '0.82rem' }}>◆</span>
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
      <section className="py-20 section-pad text-center" style={{ background: '#3D2B1F' }}>
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
            Découvrir les ateliers ou les œuvres de Looka
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
