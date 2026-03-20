'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

export default function MentionsLegalesPage() {
  return (
    <div style={{ background: '#F5F0E8' }}>
      <section
        className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-16"
        style={{ background: '#1A1209' }}
      >
        <div className="page-header-anim">
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: '#F5F0E8',
              letterSpacing: '0.06em',
            }}
          >
            Mentions légales
          </h1>
          <span
            className="block mx-auto mt-6"
            style={{ width: 60, height: 1, background: '#C9A84C' }}
          />
        </div>
      </section>

      <section className="py-20 px-6" style={{ background: '#F5F0E8' }}>
        <div className="max-w-3xl mx-auto">
          {[
            {
              titre: 'Éditeur du site',
              content: `LucaGraphy\nSite web : lucagraphy.fr\nEmail : contact@lucagraphy.fr\nSiège social : Paris, France`,
            },
            {
              titre: 'Hébergement',
              content: 'Le site est hébergé par Replit, Inc. — 995 Market St, San Francisco, CA 94103, États-Unis.',
            },
            {
              titre: 'Propriété intellectuelle',
              content:
                "L'ensemble des contenus présents sur ce site (textes, images, œuvres calligraphiques, vidéos, logos) sont protégés par le droit d'auteur et restent la propriété exclusive de LucaGraphy. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.",
            },
            {
              titre: 'Données personnelles',
              content:
                "Les données collectées via le formulaire de contact sont utilisées uniquement pour répondre à vos demandes. Elles ne sont pas transmises à des tiers. Conformément à la loi Informatique et Libertés et au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression. Pour exercer ce droit, contactez : contact@lucagraphy.fr",
            },
            {
              titre: 'Cookies',
              content:
                "Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire ou de tracking n'est utilisé.",
            },
            {
              titre: 'Limitation de responsabilité',
              content:
                "LucaGraphy ne saurait être tenu responsable des dommages directs ou indirects causés au matériel de l'utilisateur lors de l'accès au site. Les liens hypertextes mis en place dans le cadre du présent site web en direction d'autres ressources présentes sur le réseau internet ne sauraient engager la responsabilité de LucaGraphy.",
            },
          ].map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                borderTop: '1px solid rgba(61,43,31,0.12)',
                padding: '2rem 0',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 400,
                  fontSize: '1.3rem',
                  color: '#1A1209',
                  marginBottom: '1rem',
                  letterSpacing: '0.03em',
                }}
              >
                {section.titre}
              </h2>
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.75rem',
                  lineHeight: 1.9,
                  color: '#3D2B1F',
                  whiteSpace: 'pre-line',
                }}
              >
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
