'use client';

import { motion } from 'framer-motion';
import { expositionsData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

export default function ExpositionsPage() {
  const aVenir = expositionsData.filter((e) => e.statut === 'à venir');
  const passes = expositionsData.filter((e) => e.statut === 'passé');

  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Header — vidéo background */}
      <section
        style={{
          position: 'relative',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '7rem 1.5rem 5rem',
          overflow: 'hidden',
          background: '#1A1209',
        }}
      >
        {/* Vidéo fond */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          src="/images/vernissage.mp4"
        />
        {/* Overlay sombre */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(26,18,9,0.72) 0%, rgba(26,18,9,0.55) 55%, rgba(26,18,9,1) 100%)',
          }}
        />
        {/* Bande solide anti-artefact */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: '#1A1209', zIndex: 2 }} />
        {/* Contenu */}
        <div className="page-header-anim" style={{ position: 'relative', zIndex: 1 }}>
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
            Art & Présence
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
            Expositions{' '}
            <span style={{ fontStyle: 'italic', opacity: 0.5 }}>— Exhibitions</span>
          </h1>
          <span
            style={{
              display: 'block',
              width: 60,
              height: 1,
              background: '#C9A84C',
              margin: '1.5rem auto',
            }}
          />
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              color: 'rgba(245,240,232,0.82)',
              maxWidth: '32rem',
            }}
          >
            Toutes les expositions et les lieux de rencontres avec Looka
          </p>
        </div>
      </section>

      {/* À venir */}
      {aVenir.length > 0 && (
        <section style={{ background: '#F5F0E8', padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto' }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{ marginBottom: '3.5rem' }}
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
              <span
                style={{
                  display: 'block',
                  width: 40,
                  height: 1,
                  background: '#C9A84C',
                  marginTop: '1.5rem',
                }}
              />
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
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

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.85rem',
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
                        fontSize: '0.82rem',
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
                        fontSize: '0.82rem',
                        color: 'rgba(61,43,31,0.75)',
                        letterSpacing: '0.1em',
                        marginBottom: '1.5rem',
                      }}
                    >
                      {expo.dates}
                    </p>
                    <span
                      style={{
                        display: 'block',
                        width: 40,
                        height: 1,
                        background: 'rgba(61,43,31,0.2)',
                        marginBottom: '1.5rem',
                      }}
                    />
                    {expo.description.split('\n\n').map((para, pi) => (
                      <p
                        key={pi}
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 300,
                          fontSize: '0.875rem',
                          lineHeight: 1.9,
                          color: '#3D2B1F',
                          marginBottom: pi < expo.description.split('\n\n').length - 1 ? '1rem' : 0,
                        }}
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Passées */}
      <section style={{ background: '#2A2520', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            style={{ marginBottom: '3.5rem' }}
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
              Expositions passées
            </h2>
            <span
              style={{
                display: 'block',
                width: 40,
                height: 1,
                background: '#C9A84C',
                marginTop: '1.5rem',
              }}
            />
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {passes.map((expo, i) => (
              <motion.article
                key={expo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                style={{
                  borderTop: '1px solid rgba(201,168,76,0.15)',
                  padding: '3.5rem 0',
                }}
              >
                {/* En-tête expo */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 3fr',
                    gap: '3rem',
                    alignItems: 'start',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '0.9rem',
                        color: 'rgba(245,240,232,0.88)',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                      }}
                    >
                      {expo.dates}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.75rem',
                        color: '#C9A84C',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginTop: '0.5rem',
                      }}
                    >
                      {expo.lieu}
                    </p>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontWeight: 400,
                        fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                        color: '#F5F0E8',
                        marginBottom: '1.5rem',
                        lineHeight: 1.2,
                        letterSpacing: '0.03em',
                      }}
                    >
                      « {expo.titre} »
                    </h3>
                    {expo.description.split('\n\n').map((para, pi) => (
                      <p
                        key={pi}
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.875rem',
                          fontWeight: 300,
                          lineHeight: 1.9,
                          color: 'rgba(245,240,232,0.85)',
                          marginBottom: pi < expo.description.split('\n\n').length - 1 ? '1rem' : 0,
                        }}
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
