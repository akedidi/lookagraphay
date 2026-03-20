'use client';

import { motion } from 'framer-motion';
import { ateliersData } from '@/lib/data';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

export default function AteliersPage() {
  const cours = ateliersData[0];

  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <section
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 1.5rem 5rem', background: '#2A2520' }}
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
            Transmission & Pratique
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
            Ateliers & Cours
          </h1>
          <span
            className="block mx-auto"
            style={{ width: 60, height: 1, background: '#C9A84C', marginBottom: '1.5rem' }}
          />
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.8rem',
              lineHeight: 1.9,
              color: 'rgba(245,240,232,0.85)',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            {cours.description}
          </p>
        </div>
      </section>

      {/* Stats rapides */}
      <section className="py-14 section-pad" style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" style={{ maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto' }}>
          {[
            { label: 'Horaire', value: 'Samedi', desc: 'à 14h' },
            { label: 'Lieu', value: 'Montparnasse', desc: 'Paris' },
            { label: 'Niveau', value: 'Tous', desc: 'niveaux acceptés' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
            >
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.72rem',
                  letterSpacing: '0.38em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  marginBottom: '0.5rem',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '2.2rem',
                  fontWeight: 300,
                  color: '#1A1209',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.78rem',
                  color: '#3D2B1F',
                  opacity: 0.75,
                }}
              >
                {item.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophie du cours */}
      <section className="py-28 section-pad" style={{ background: '#F5F0E8' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center" style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-xl mx-auto lg:max-w-none lg:mx-0"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.5rem',
              }}
            >
              L'esprit du cours
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                color: '#1A1209',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              Un moment de<br />
              <em>méditation et de voyage</em>
            </h2>
            <span style={{ display: 'block', width: 40, height: 1, background: '#C9A84C', marginBottom: '2rem' }} />
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
                fontSize: '0.82rem',
                lineHeight: 2,
                color: '#3D2B1F',
              }}
            >
              {cours.philosophie}
            </p>
          </motion.div>

          {/* Ornement calligraphique */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '1',
              background: 'linear-gradient(135deg, #2A2520 0%, #1A1209 100%)',
            }}
          >
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(5rem, 12vw, 10rem)',
                color: '#C9A84C',
                opacity: 0.25,
                lineHeight: 1,
                userSelect: 'none',
                direction: 'rtl',
              }}
            >
              خط
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contenu du cours */}
      <section className="py-24 section-pad" style={{ background: '#1A1209' }}>
        <div style={{ maxWidth: "56rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.2rem',
              }}
            >
              Programme
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#F5F0E8',
                letterSpacing: '0.05em',
              }}
            >
              Contenu du cours
            </h2>
            <span className="gold-line" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(201,168,76,0.1)' }}>
            {cours.programme.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{
                  background: '#1A1209',
                  padding: '2.5rem 2rem',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '2rem',
                    color: '#C9A84C',
                    opacity: 0.25,
                    lineHeight: 1,
                    marginBottom: '1rem',
                    fontWeight: 300,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 300,
                    color: 'rgba(245,240,232,0.87)',
                    lineHeight: 1.7,
                  }}
                >
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Infos & Inscription */}
      <section className="py-28 section-pad" style={{ background: '#FAF7F2' }}>
        <div style={{ maxWidth: "56rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.2rem',
              }}
            >
              Rejoindre le cours
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#1A1209',
                letterSpacing: '0.05em',
              }}
            >
              Infos & Inscription
            </h2>
            <span style={{ display: 'block', width: 50, height: 1, background: '#C9A84C', margin: '1.5rem auto 0' }} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Infos pratiques */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{
                border: '1px solid rgba(61,43,31,0.12)',
                padding: '2.5rem',
                background: '#F5F0E8',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 400,
                  fontSize: '1.4rem',
                  color: '#1A1209',
                  marginBottom: '2rem',
                  letterSpacing: '0.04em',
                }}
              >
                Informations pratiques
              </h3>

              {[
                { label: 'Horaire', value: cours.horaires },
                { label: 'Adresse', value: cours.lieu },
                { label: 'Niveau', value: cours.niveau },
                { label: 'Disponibilité', value: cours.dates },
              ].map((info) => (
                <div
                  key={info.label}
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    paddingBottom: '1.25rem',
                    marginBottom: '1.25rem',
                    borderBottom: '1px solid rgba(61,43,31,0.08)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.72rem',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                      minWidth: 90,
                      paddingTop: '0.15rem',
                    }}
                  >
                    {info.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 300,
                      color: '#3D2B1F',
                      lineHeight: 1.5,
                    }}
                  >
                    {info.value}
                  </span>
                </div>
              ))}

              {/* Transport */}
              <div style={{ marginTop: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.72rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    display: 'block',
                    marginBottom: '0.75rem',
                  }}
                >
                  Accès
                </span>
                {cours.transport.map((ligne, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: 300,
                      color: '#3D2B1F',
                      lineHeight: 1.7,
                    }}
                  >
                    {ligne}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{
                background: '#1A1209',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '2rem',
              }}
            >
              <div className="ornament" style={{ fontSize: '2rem', opacity: 0.3 }}>خ</div>
              <div>
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 300,
                    fontSize: '1.6rem',
                    color: '#F5F0E8',
                    letterSpacing: '0.04em',
                    marginBottom: '1rem',
                    lineHeight: 1.3,
                  }}
                >
                  Inscription et<br />
                  <em>informations</em>
                </h3>
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 300,
                    color: 'rgba(245,240,232,0.82)',
                    lineHeight: 1.8,
                    marginBottom: '2rem',
                  }}
                >
                  Pour vous inscrire ou obtenir plus d'informations, écrivez directement à Looka. Elle répond personnellement à chaque message.
                </p>
                <a
                  href={`mailto:${cours.contact}`}
                  className="btn-gold btn-gold-solid"
                  style={{ display: 'inline-block' }}
                >
                  {cours.contact}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 section-pad" style={{ background: '#2A2520' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: '2rem',
                color: '#F5F0E8',
                letterSpacing: '0.05em',
              }}
            >
              Questions pratiques
            </h2>
            <span className="gold-line" />
          </motion.div>
          {[
            {
              q: 'Faut-il des connaissances en arabe ?',
              r: "Aucune ! La calligraphie arabe est avant tout un art visuel. Vous n'avez pas besoin de lire ou parler arabe pour pratiquer et créer de belles œuvres.",
            },
            {
              q: 'Le cours convient-il aux débutants complets ?',
              r: "Absolument. Le cours accueille tous les niveaux. Que vous débutiez ou ayez déjà une pratique, Looka adapte l'enseignement à chaque participant.",
            },
            {
              q: "Comment s'inscrire ?",
              r: `Écrivez à Looka par email à ${cours.contact} pour vous inscrire ou obtenir toutes les informations sur le cours (tarifs, dates, matériel).`,
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                borderTop: '1px solid rgba(201,168,76,0.12)',
                padding: '1.75rem 0',
              }}
            >
              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.15rem',
                  color: '#F5F0E8',
                  marginBottom: '0.75rem',
                  letterSpacing: '0.02em',
                }}
              >
                {faq.q}
              </h3>
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 300,
                  color: 'rgba(245,240,232,0.82)',
                  lineHeight: 1.8,
                }}
              >
                {faq.r}
              </p>
            </motion.div>
          ))}
          <div style={{ borderTop: '1px solid rgba(201,168,76,0.12)', paddingTop: '2rem', textAlign: 'center' }}>
            <a
              href={`mailto:${cours.contact}`}
              className="btn-gold"
              style={{ display: 'inline-block' }}
            >
              Écrire à Looka
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
