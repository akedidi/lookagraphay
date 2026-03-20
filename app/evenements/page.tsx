'use client';

import { motion } from 'framer-motion';
import { evenementsData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

const typeColors: Record<string, string> = {
  Vernissage: '#C9A84C',
  Performance: '#A07830',
  'Portes ouvertes': '#C9A84C',
  Conférence: '#A07830',
};

export default function EvenementsPage() {
  const aVenir = evenementsData.filter((e) => e.statut === 'à venir');
  const passes = evenementsData.filter((e) => e.statut === 'passé');

  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <section
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 1.5rem 4rem', background: '#3D2B1F' }}
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
            Agenda
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
            Événements
          </h1>
          <span
            className="block mx-auto mt-6"
            style={{ width: 60, height: 1, background: '#C9A84C' }}
          />
        </div>
      </section>

      {/* À venir */}
      <section className="py-24 section-pad" style={{ background: '#F5F0E8' }}>
        <div style={{ maxWidth: "56rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-14"
          >
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
              Agenda
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                color: '#1A1209',
                letterSpacing: '0.04em',
              }}
            >
              Prochains événements
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginTop: '1.5rem' }} />
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {aVenir.map((evt, i) => (
              <motion.article
                key={evt.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                style={{
                  borderTop: '1px solid rgba(61,43,31,0.12)',
                  padding: '2.5rem 0',
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: '3rem',
                  alignItems: 'start',
                }}
              >
                {/* Date */}
                <div>
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '2rem',
                      fontWeight: 300,
                      color: '#C9A84C',
                      lineHeight: 1,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {evt.date.split(' ')[0]}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(61,43,31,0.75)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {evt.date.replace(/^\d+\s/, '')}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.82rem',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: typeColors[evt.type] || '#C9A84C',
                      border: `1px solid ${typeColors[evt.type] || '#C9A84C'}`,
                      padding: '0.2rem 0.6rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {evt.type}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 400,
                      fontSize: '1.5rem',
                      color: '#1A1209',
                      letterSpacing: '0.03em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {evt.titre}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.8rem',
                      color: 'rgba(61,43,31,0.75)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {evt.heure}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.8rem',
                      color: '#C9A84C',
                      marginBottom: '1rem',
                    }}
                  >
                    {evt.lieu}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 300,
                      lineHeight: 1.7,
                      color: '#3D2B1F',
                    }}
                  >
                    {evt.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Passés */}
      <section className="py-20 section-pad" style={{ background: '#2A2520' }}>
        <div style={{ maxWidth: "56rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-14"
          >
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
              Archives
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
              Événements passés
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginTop: '1.5rem' }} />
          </motion.div>

          {passes.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                borderTop: '1px solid rgba(201,168,76,0.1)',
                padding: '1.5rem 0',
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '2rem',
                alignItems: 'start',
              }}
            >
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.8rem',
                  color: 'rgba(245,240,232,0.82)',
                }}
              >
                {evt.date}
              </span>
              <div>
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.2rem',
                    color: 'rgba(245,240,232,0.88)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {evt.titre}
                </h3>
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(201,168,76,0.8)',
                  }}
                >
                  {evt.lieu}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
