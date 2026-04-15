'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type StoreItem = {
  id: number;
  titre: string;
  sous_titre?: string;
  categorie: string;
  description?: string;
  citation?: string;
  technique?: string;
  dimensions?: string;
  annee?: string;
  prix: number;
  images?: string[];
  disponible: boolean;
  paypal_link?: string;
  ordre?: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

const arabicLetters = ['ب', 'ل', 'ن', 'م', 'ح', 'ع'];

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [selected, setSelected] = useState<StoreItem | null>(null);
  const [modalImg, setModalImg] = useState(0);

  useEffect(() => {
    fetch('/api/store')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', ...Array.from(new Set(items.map(s => s.categorie)))];
  const filtered = filter === 'Tous' ? items : items.filter(s => s.categorie === filter);

  function openItem(item: StoreItem) {
    setSelected(item);
    setModalImg(0);
  }

  const modalImages = selected?.images ?? [];

  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 1.5rem 4rem', background: '#1A1209' }}>
        <div className="page-header-anim">
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: '1.5rem' }}>
            Acquérir une pièce
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: '#F5F0E8', letterSpacing: '0.06em', lineHeight: 1.1 }}>
            Store
          </h1>
          <span className="block mx-auto mt-6" style={{ width: 60, height: 1, background: '#C9A84C' }} />
        </div>
      </section>

      {/* Filtres */}
      <section style={{ padding: '2.5rem 1.5rem', background: '#FAF7F2', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
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

      {/* Bandeau collection Lettres d'Âme */}
      {['Bague', "Boucles d'oreilles", 'Pendentif'].includes(filter) && (
        <section style={{ background: '#1A1209', padding: '3rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ maxWidth: '52rem', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.35em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Collection
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#F5F0E8', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              Lettres d'Âme
            </h2>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', color: 'rgba(245,240,232,0.75)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
              Chaque pièce raconte une histoire calligraphiée avec émotion et façonnée avec passion. Chaque lettre s'entrelace dans des designs subtils et délicats, donnant naissance à des bijoux qui capturent l'essence de l'amour, de la liberté et de l'expression personnelle.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {[
                { label: 'Bagues', detail: 'Argent 80 € · Or 90 €' },
                { label: 'Pendentifs', detail: 'Argent 70 € · Or 80 €' },
                { label: 'Boucles d\'oreilles', detail: 'Paire argent 120 € · Or 130 €' },
              ].map(({ label, detail }) => (
                <div key={label} style={{ border: '1px solid rgba(201,168,76,0.25)', padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.3rem' }}>{label}</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.9rem', color: 'rgba(245,240,232,0.7)' }}>{detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grille */}
      <section style={{ padding: '4rem 1.5rem 8rem', background: '#F5F0E8' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'rgba(61,43,31,0.4)' }}>
              Chargement…
            </div>
          )}
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                onClick={() => openItem(item)}
                style={{
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #3D2B1F, #1A1209)',
                  aspectRatio: i % 4 === 1 ? '2/3' : '4/5',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{ y: -4 }}
              >
                {/* Lettre arabe décorative (fallback) */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#C9A84C', opacity: 0.3 }}>
                    {arabicLetters[i % arabicLetters.length]}
                  </div>
                </div>

                {/* Image réelle */}
                {item.images?.[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.images[0]}
                    alt={item.titre}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', transition: 'transform 0.6s ease' }}
                  />
                )}

                {/* Gradient + infos permanents */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,9,0.88) 0%, rgba(26,18,9,0.2) 45%, transparent 70%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#F5F0E8', marginBottom: '0.15rem', lineHeight: 1.25 }}>
                    {item.titre}
                  </h3>
                  {item.sous_titre && (
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(245,240,232,0.7)', marginBottom: '0.3rem' }}>
                      {item.sous_titre}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>
                      {item.categorie}{item.annee ? ` · ${item.annee}` : ''}
                    </p>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 300, color: '#C9A84C' }}>
                      {item.prix} €
                    </span>
                  </div>
                </div>

                {/* Badge disponible */}
                {item.disponible && (
                  <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', background: 'rgba(26,18,9,0.75)', padding: '0.25rem 0.5rem', border: '1px solid rgba(201,168,76,0.4)' }}>
                    Dispo
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,9,0.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#FAF7F2', maxWidth: 860, width: '100%', maxHeight: '92vh', overflow: 'auto', display: 'flex', flexWrap: 'wrap' }}
            >
              {/* Visuel gauche */}
              <div style={{ position: 'relative', background: '#1A1209', flex: '1 1 300px', minWidth: 0, minHeight: 320 }}>
                {modalImages.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={modalImg}
                      src={modalImages[modalImg]}
                      alt={selected.titre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', position: 'absolute', inset: 0 }}
                    />
                    {modalImages.length > 1 && (
                      <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        {modalImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setModalImg(idx); }}
                            style={{ width: idx === modalImg ? 24 : 8, height: 8, background: idx === modalImg ? '#C9A84C' : 'rgba(201,168,76,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }}
                          />
                        ))}
                      </div>
                    )}
                    {modalImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setModalImg((modalImg - 1 + modalImages.length) % modalImages.length); }}
                          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(26,18,9,0.7)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', width: 36, height: 36, cursor: 'pointer', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >‹</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setModalImg((modalImg + 1) % modalImages.length); }}
                          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(26,18,9,0.7)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', width: 36, height: 36, cursor: 'pointer', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >›</button>
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
              <div style={{ flex: '1 1 300px', minWidth: 0, padding: '2.5rem 2rem', overflowY: 'auto' }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.25em', color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}
                >
                  ← Fermer
                </button>

                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: '0.6rem' }}>
                  {selected.categorie}{selected.annee ? ` · ${selected.annee}` : ''}
                </span>

                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: '1.6rem', color: '#1A1209', letterSpacing: '0.03em', marginBottom: '0.3rem', lineHeight: 1.2 }}>
                  {selected.titre}
                </h2>

                {selected.sous_titre && (
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#3D2B1F', marginBottom: '1rem' }}>
                    {selected.sous_titre}
                  </p>
                )}

                <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '1.25rem' }} />

                {selected.citation && (
                  <blockquote style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.7, color: '#3D2B1F', borderLeft: '2px solid #C9A84C', paddingLeft: '1rem', marginBottom: '1.25rem' }}>
                    {selected.citation}
                  </blockquote>
                )}

                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.76rem', fontWeight: 300, lineHeight: 1.9, color: '#3D2B1F', marginBottom: '1.5rem' }}>
                  {selected.description}
                </p>

                {(selected.technique || selected.dimensions) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Technique', value: selected.technique },
                      { label: 'Dimensions', value: selected.dimensions },
                    ].filter(i => i.value).map((info) => (
                      <div key={info.label}>
                        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: '0.1rem' }}>
                          {info.label}
                        </span>
                        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', fontWeight: 300, color: '#3D2B1F' }}>
                          {info.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#C9A84C' }}>
                    {selected.prix} €
                  </div>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: selected.disponible ? '#C9A84C' : 'rgba(61,43,31,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    {selected.disponible ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>

                {selected.disponible && selected.paypal_link && (
                  <a
                    href={selected.paypal_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                    style={{ display: 'block', textAlign: 'center' }}
                  >
                    Acheter via PayPal
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note commande sur mesure */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', background: '#1A1209' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="ornament mb-6" style={{ fontSize: '1rem' }}>◆</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: '1.6rem', color: '#F5F0E8', marginBottom: '1rem' }}>
            Commande sur mesure
          </h2>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, fontSize: '0.75rem', lineHeight: 1.8, color: 'rgba(245,240,232,0.82)', marginBottom: '2rem' }}>
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
