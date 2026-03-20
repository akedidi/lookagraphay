'use client';

import { motion } from 'framer-motion';
import { expositionsData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } },
};

export default function ExpositionsPage() {
  const aVenir = expositionsData.filter((e) => e.statut === 'à venir');
  const passes = expositionsData.filter((e) => e.statut === 'passé');

  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-20"
        style={{ background: '#1A1209' }}
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
            Art & Présence
          </span>
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: '#F5F0E8',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
            }}
          >
            Expositions
          </h1>
          <span
            className="block mx-auto mt-6"
            style={{ width: 60, height: 1, background: '#C9A84C' }}
          />
        </motion.div>
      </section>

      {/* À venir */}
      {aVenir.length > 0 && (
        <section className="py-24 px-6" style={{ background: '#F5F0E8' }}>
          <div className="max-w-5xl mx-auto">
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
                  fontSize: '0.6rem',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  display: 'block',
                  marginBottom: '1rem',
                }}
              >
                Prochainement
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
                Expositions à venir
              </h2>
              <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginTop: '1.5rem' }} />
            </motion.div>

            <div className="flex flex-col gap-12">
              {aVenir.map((expo, i) => (
                <motion.article
                  key={expo.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '4rem',
                    borderTop: '1px solid rgba(61,43,31,0.12)',
                    paddingTop: '3rem',
                  }}
                >
                  {/* Visuel */}
                  <div
                    style={{
                      aspectRatio: '4/5',
                      background: 'linear-gradient(135deg, #3D2B1F, #1A1209)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '5rem',
                        color: '#C9A84C',
                        opacity: 0.25,
                      }}
                    >
                      {['ص', 'ن'][i]}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-center">
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.55rem',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#C9A84C',
                        border: '1px solid rgba(201,168,76,0.4)',
                        padding: '0.25rem 0.75rem',
                        marginBottom: '1.5rem',
                        width: 'fit-content',
                      }}
                    >
                      {expo.statut}
                    </span>
                    <h2
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontWeight: 400,
                        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                        color: '#1A1209',
                        letterSpacing: '0.03em',
                        marginBottom: '1rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {expo.titre}
                    </h2>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.7rem',
                        color: '#C9A84C',
                        letterSpacing: '0.15em',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {expo.lieu}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.7rem',
                        color: 'rgba(61,43,31,0.5)',
                        letterSpacing: '0.1em',
                        marginBottom: '1.5rem',
                      }}
                    >
                      {expo.dates}
                    </p>
                    <span
                      style={{ display: 'block', width: 40, height: 1, background: 'rgba(61,43,31,0.2)', marginBottom: '1.5rem' }}
                    />
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 300,
                        fontSize: '0.78rem',
                        lineHeight: 1.9,
                        color: '#3D2B1F',
                      }}
                    >
                      {expo.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Passées */}
      <section className="py-24 px-6" style={{ background: '#2A2520' }}>
        <div className="max-w-5xl mx-auto">
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
                fontSize: '0.6rem',
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
              Expositions passées
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginTop: '1.5rem' }} />
          </motion.div>

          <div className="flex flex-col gap-0">
            {passes.map((expo, i) => (
              <motion.div
                key={expo.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  borderTop: '1px solid rgba(201,168,76,0.1)',
                  padding: '2.5rem 0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 3fr',
                  gap: '3rem',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '0.9rem',
                      color: 'rgba(245,240,232,0.35)',
                      lineHeight: 1.5,
                    }}
                  >
                    {expo.dates}
                  </p>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 400,
                      fontSize: '1.5rem',
                      color: 'rgba(245,240,232,0.7)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {expo.titre}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.65rem',
                      color: '#C9A84C',
                      letterSpacing: '0.12em',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {expo.lieu}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.72rem',
                      fontWeight: 300,
                      lineHeight: 1.7,
                      color: 'rgba(245,240,232,0.4)',
                    }}
                  >
                    {expo.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
