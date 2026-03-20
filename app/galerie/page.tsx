'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { galerieData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

const arabicLetters = ['ب', 'ل', 'ن', 'م', 'ح', 'ع'];

export default function GaleriePage() {
  const [selected, setSelected] = useState<typeof galerieData[0] | null>(null);
  const [filter, setFilter] = useState('Tous');
  const styles = ['Tous', ...Array.from(new Set(galerieData.map((o) => o.style)))];

  const filtered =
    filter === 'Tous' ? galerieData : galerieData.filter((o) => o.style === filter);

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
            Œuvres
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
            Galerie
          </h1>
          <span
            className="block mx-auto mt-6"
            style={{ width: 60, height: 1, background: '#C9A84C' }}
          />
        </div>
      </section>

      {/* Filtres */}
      <section className="py-10 section-pad" style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setFilter(style)}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                padding: '0.5rem 1.5rem',
                border: `1px solid ${filter === style ? '#C9A84C' : 'rgba(61,43,31,0.2)'}`,
                background: filter === style ? '#C9A84C' : 'transparent',
                color: filter === style ? '#1A1209' : 'rgba(61,43,31,0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* Grille */}
      <section className="py-16 section-pad pb-32" style={{ background: '#F5F0E8' }}>
        <div style={{ maxWidth: "72rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filtered.map((oeuvre, i) => (
                <motion.div
                  key={oeuvre.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setSelected(oeuvre)}
                  className="img-zoom"
                  style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #3D2B1F, #1A1209)',
                    aspectRatio: i % 4 === 1 ? '2/3' : '1/1',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  whileHover={{ y: -4 }}
                >
                  {/* Placeholder visuel */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: 'clamp(3rem, 6vw, 5rem)',
                        color: '#C9A84C',
                        opacity: 0.3,
                      }}
                    >
                      {arabicLetters[i % arabicLetters.length]}
                    </div>
                  </div>

                  {/* Overlay info */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(26,18,9,0.92) 0%, transparent 50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '1.5rem',
                      opacity: 0,
                      transition: 'opacity 0.4s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = '1')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = '0')}
                  >
                    <h3
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '1.1rem',
                        color: '#F5F0E8',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {oeuvre.titre}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.85rem',
                        letterSpacing: '0.2em',
                        color: '#C9A84C',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {oeuvre.style}
                    </p>
                    <div className="flex justify-between items-center">
                      <span
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.8rem',
                          color: 'rgba(245,240,232,0.82)',
                        }}
                      >
                        {oeuvre.dimensions}
                      </span>
                      {oeuvre.disponible && (
                        <span
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '0.85rem',
                            color: '#C9A84C',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge disponible */}
                  {oeuvre.disponible && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#C9A84C',
                        opacity: 0.9,
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Modal œuvre */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(26,18,9,0.92)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FAF7F2',
                maxWidth: 800,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              {/* Visuel */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #3D2B1F, #1A1209)',
                  minHeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '6rem',
                    color: '#C9A84C',
                    opacity: 0.3,
                  }}
                >
                  ل
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '3rem' }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.25em',
                    color: '#C9A84C',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textTransform: 'uppercase',
                  }}
                >
                  ← Fermer
                </button>

                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.85rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    display: 'block',
                    marginBottom: '0.75rem',
                  }}
                >
                  {selected.style} · {selected.annee}
                </span>
                <h2
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 400,
                    fontSize: '1.8rem',
                    color: '#1A1209',
                    letterSpacing: '0.03em',
                    marginBottom: '1.5rem',
                    lineHeight: 1.2,
                  }}
                >
                  {selected.titre}
                </h2>
                <span
                  style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '1.5rem' }}
                />
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 300,
                    lineHeight: 1.9,
                    color: '#3D2B1F',
                    marginBottom: '2rem',
                  }}
                >
                  {selected.description}
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  {[
                    { label: 'Technique', value: selected.technique },
                    { label: 'Dimensions', value: selected.dimensions },
                  ].map((info) => (
                    <div key={info.label}>
                      <span
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.85rem',
                          letterSpacing: '0.25em',
                          textTransform: 'uppercase',
                          color: '#C9A84C',
                        }}
                      >
                        {info.label}
                      </span>
                      <p
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.85rem',
                          fontWeight: 300,
                          color: '#3D2B1F',
                        }}
                      >
                        {info.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-end justify-between mb-6">
                  <div
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '2rem',
                      fontWeight: 300,
                      color: '#C9A84C',
                    }}
                  >
                    {selected.prix} €
                  </div>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.85rem',
                      color: selected.disponible ? '#C9A84C' : 'rgba(61,43,31,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {selected.disponible ? 'Disponible' : 'Collection privée'}
                  </span>
                </div>

                {selected.disponible && (
                  <Link href="/store" className="btn-gold btn-gold-solid" style={{ width: '100%', textAlign: 'center' }}>
                    Acquérir cette œuvre
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
