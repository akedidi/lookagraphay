'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storeData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

const arabicLetters = ['ب', 'ل', 'ن', 'م', 'ح', 'ع'];

const categories = ['Tous', ...Array.from(new Set(storeData.map((s) => s.categorie)))];

export default function StorePage() {
  const [filter, setFilter] = useState('Tous');
  const filtered = filter === 'Tous' ? storeData : storeData.filter((s) => s.categorie === filter);

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
            Acquérir une pièce
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
            Store
          </h1>
          <span
            className="block mx-auto mt-6"
            style={{ width: 60, height: 1, background: '#C9A84C', marginBottom: '1.5rem' }}
          />
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.75rem',
              lineHeight: 1.8,
              color: 'rgba(245,240,232,0.82)',
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            Chaque pièce est unique, réalisée à la main. Acquérir une œuvre de Looka, c'est accueillir un fragment de présence.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section
        className="py-8 section-pad"
        style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(61,43,31,0.08)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                padding: '0.5rem 1.5rem',
                border: `1px solid ${filter === cat ? '#C9A84C' : 'rgba(61,43,31,0.2)'}`,
                background: filter === cat ? '#C9A84C' : 'transparent',
                color: filter === cat ? '#1A1209' : 'rgba(61,43,31,0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Produits */}
      <section className="py-16 section-pad pb-32" style={{ background: '#F5F0E8' }}>
        <div style={{ maxWidth: "72rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: '#FAF7F2',
                    border: '1px solid rgba(61,43,31,0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Visuel */}
                  <div
                    className="img-zoom"
                    style={{
                      aspectRatio: '1/1',
                      background: `linear-gradient(${135 + i * 25}deg, #3D2B1F, #1A1209)`,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '4rem',
                        color: '#C9A84C',
                        opacity: 0.3,
                      }}
                    >
                      {arabicLetters[i % arabicLetters.length]}
                    </div>

                    <span
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.75rem',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: '#C9A84C',
                        background: 'rgba(26,18,9,0.75)',
                        padding: '0.35rem 0.75rem',
                      }}
                    >
                      {item.categorie}
                    </span>

                    {!item.disponible && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(26,18,9,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '0.75rem',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: 'rgba(245,240,232,0.6)',
                          }}
                        >
                          Épuisé
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    style={{
                      padding: '1.5rem',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontWeight: 400,
                        fontSize: '1.2rem',
                        color: '#1A1209',
                        letterSpacing: '0.03em',
                        marginBottom: '0.75rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.titre}
                    </h2>
                    <p
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '0.82rem',
                        fontWeight: 300,
                        lineHeight: 1.7,
                        color: 'rgba(61,43,31,0.6)',
                        marginBottom: '1.5rem',
                        flex: 1,
                      }}
                    >
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem' }}>
                      <span
                        style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: '1.6rem',
                          fontWeight: 300,
                          color: '#C9A84C',
                        }}
                      >
                        {item.prix} €
                      </span>

                      {item.disponible ? (
                        <a
                          href={item.paypalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-gold"
                          style={{ fontSize: '0.72rem', padding: '0.75rem 1.25rem' }}
                        >
                          Acheter via PayPal
                        </a>
                      ) : (
                        <span
                          style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '0.85rem',
                            color: 'rgba(61,43,31,0.35)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                          }}
                        >
                          Indisponible
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Note acquisition */}
      <section className="py-16 section-pad text-center" style={{ background: '#1A1209' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ maxWidth: 560, margin: '0 auto' }}
        >
          <div className="ornament mb-6" style={{ fontSize: '1rem' }}>◆</div>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: '1.6rem',
              color: '#F5F0E8',
              marginBottom: '1rem',
            }}
          >
            Commande sur mesure
          </h2>
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.75rem',
              lineHeight: 1.8,
              color: 'rgba(245,240,232,0.82)',
              marginBottom: '2rem',
            }}
          >
            Vous souhaitez une œuvre personnalisée — un mot, un prénom, un verset — calligraphié dans un style particulier ? Contactez Looka pour discuter de votre projet.
          </p>
          <a href="/contact" className="btn-gold">
            Demander une création sur mesure
          </a>
        </motion.div>
      </section>
    </div>
  );
}
