'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { galerieData } from '@/lib/data';

type Oeuvre = typeof galerieData[0] & {
  sousTitre?: string;
  citation?: string;
  images?: string[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

const arabicLetters = ['ب', 'ل', 'ن', 'م', 'ح', 'ع'];

export default function GaleriePage() {
  const [selected, setSelected] = useState<Oeuvre | null>(null);
  const [filter, setFilter] = useState('Tous');
  const [modalImg, setModalImg] = useState(0);
  const styles = ['Tous', ...Array.from(new Set(galerieData.map((o) => o.style)))];

  const filtered =
    filter === 'Tous' ? galerieData : galerieData.filter((o) => o.style === filter);

  function openOeuvre(oeuvre: Oeuvre) {
    setSelected(oeuvre);
    setModalImg(0);
  }

  const modalImages = selected?.images ?? (selected?.image ? [selected.image] : []);

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
      <section style={{ padding: '2.5rem 1.5rem', background: '#FAF7F2', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
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
      <section style={{ padding: '4rem 1.5rem 8rem', background: '#F5F0E8' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {(filtered as Oeuvre[]).map((oeuvre, i) => (
              <motion.div
                key={oeuvre.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                onClick={() => openOeuvre(oeuvre)}
                style={{
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #3D2B1F, #1A1209)',
                  aspectRatio: i % 4 === 1 ? '2/3' : '4/5',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{ y: -4 }}
              >
                {/* Lettre arabe décorative (fond, toujours visible) */}
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

                {/* Image réelle par-dessus (masquée si 404) */}
                {oeuvre.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={oeuvre.image}
                    alt={oeuvre.titre}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      transition: 'transform 0.6s ease',
                    }}
                  />
                )}

                {/* Overlay au hover */}
                <div
                  className="galerie-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(26,18,9,0.92) 0%, rgba(26,18,9,0.1) 60%, transparent 100%)',
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
                      marginBottom: '0.2rem',
                    }}
                  >
                    {oeuvre.titre}
                  </h3>
                  {(oeuvre as Oeuvre).sousTitre && (
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(245,240,232,0.7)', marginBottom: '0.4rem' }}>
                      {(oeuvre as Oeuvre).sousTitre}
                    </p>
                  )}
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.72rem',
                      letterSpacing: '0.2em',
                      color: '#C9A84C',
                      textTransform: 'uppercase',
                    }}
                  >
                    {oeuvre.style} · {oeuvre.annee}
                  </p>
                </div>

                {/* Badge disponible */}
                {oeuvre.disponible && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.62rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                      background: 'rgba(26,18,9,0.75)',
                      padding: '0.25rem 0.5rem',
                      border: '1px solid rgba(201,168,76,0.4)',
                    }}
                  >
                    Dispo
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
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
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FAF7F2',
                maxWidth: 860,
                width: '100%',
                maxHeight: '92vh',
                overflow: 'auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              }}
            >
              {/* Visuel gauche */}
              <div style={{ position: 'relative', background: '#1A1209', minHeight: 420 }}>
                {modalImages.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={modalImg}
                      src={modalImages[modalImg]}
                      alt={selected.titre}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        display: 'block',
                        minHeight: 420,
                      }}
                    />
                    {/* Navigation photos si plusieurs */}
                    {modalImages.length > 1 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          left: 0,
                          right: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {modalImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setModalImg(idx); }}
                            style={{
                              width: idx === modalImg ? 24 : 8,
                              height: 8,
                              background: idx === modalImg ? '#C9A84C' : 'rgba(201,168,76,0.4)',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              padding: 0,
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {/* Flèches navigation */}
                    {modalImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setModalImg((modalImg - 1 + modalImages.length) % modalImages.length); }}
                          style={{
                            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(26,18,9,0.7)', border: '1px solid rgba(201,168,76,0.3)',
                            color: '#C9A84C', width: 36, height: 36, cursor: 'pointer',
                            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setModalImg((modalImg + 1) % modalImages.length); }}
                          style={{
                            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(26,18,9,0.7)', border: '1px solid rgba(201,168,76,0.3)',
                            color: '#C9A84C', width: 36, height: 36, cursor: 'pointer',
                            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '6rem', color: '#C9A84C', opacity: 0.3 }}>ل</div>
                  </div>
                )}
              </div>

              {/* Info droite */}
              <div style={{ padding: '2.5rem 2rem', overflowY: 'auto' }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.72rem',
                    letterSpacing: '0.25em',
                    color: '#C9A84C',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
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
                    fontSize: '0.72rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    display: 'block',
                    marginBottom: '0.6rem',
                  }}
                >
                  {selected.style} · {selected.annee}
                </span>

                <h2
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 400,
                    fontSize: '1.6rem',
                    color: '#1A1209',
                    letterSpacing: '0.03em',
                    marginBottom: '0.3rem',
                    lineHeight: 1.2,
                  }}
                >
                  {selected.titre}
                </h2>

                {(selected as Oeuvre).sousTitre && (
                  <p
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontStyle: 'italic',
                      fontSize: '1.05rem',
                      color: '#3D2B1F',
                      marginBottom: '1rem',
                    }}
                  >
                    {(selected as Oeuvre).sousTitre}
                  </p>
                )}

                <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '1.25rem' }} />

                {/* Citation si disponible */}
                {(selected as Oeuvre).citation && (
                  <blockquote
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontStyle: 'italic',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      color: '#3D2B1F',
                      borderLeft: '2px solid #C9A84C',
                      paddingLeft: '1rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {(selected as Oeuvre).citation}
                  </blockquote>
                )}

                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.76rem',
                    fontWeight: 300,
                    lineHeight: 1.9,
                    color: '#3D2B1F',
                    marginBottom: '1.5rem',
                  }}
                >
                  {selected.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Technique', value: selected.technique },
                    { label: 'Dimensions', value: selected.dimensions },
                  ].map((info) => (
                    <div key={info.label}>
                      <span
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.68rem',
                          letterSpacing: '0.25em',
                          textTransform: 'uppercase',
                          color: '#C9A84C',
                          display: 'block',
                          marginBottom: '0.1rem',
                        }}
                      >
                        {info.label}
                      </span>
                      <p
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.8rem',
                          fontWeight: 300,
                          color: '#3D2B1F',
                        }}
                      >
                        {info.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
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
                      fontSize: '0.72rem',
                      color: selected.disponible ? '#C9A84C' : 'rgba(61,43,31,0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {selected.disponible ? 'Disponible' : 'Collection privée'}
                  </span>
                </div>

                {selected.disponible && (
                  <Link href="/contact" className="btn-gold btn-gold-solid" style={{ display: 'block', textAlign: 'center' }}>
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
