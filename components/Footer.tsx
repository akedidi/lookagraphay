'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/data';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#1A1209',
        borderTop: '1px solid rgba(201,168,76,0.15)',
        padding: '4rem 0 2rem',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.6rem',
                fontWeight: 300,
                letterSpacing: '0.12em',
                color: '#F5F0E8',
                marginBottom: '0.5rem',
              }}
            >
              LookaGraphy
            </div>
            <div
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '1.5rem',
              }}
            >
              Calligraphie Arabe
            </div>
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 300,
                lineHeight: 1.8,
                color: 'rgba(245,240,232,0.5)',
                maxWidth: '260px',
              }}
            >
              Atelier de calligraphie arabe à Paris.<br />
              Création, enseignement, transmission.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '1.5rem',
              }}
            >
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/artiste', label: "L'Artiste" },
                { href: '/ateliers', label: 'Ateliers' },
                { href: '/expositions', label: 'Expositions' },
                { href: '/galerie', label: 'Galerie' },
                { href: '/store', label: 'Store' },
                { href: '/contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.7rem',
                      fontWeight: 300,
                      letterSpacing: '0.1em',
                      color: 'rgba(245,240,232,0.5)',
                      textDecoration: 'none',
                      transition: 'color 0.3s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.5)')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '1.5rem',
              }}
            >
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${siteConfig.email}`}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 300,
                  color: 'rgba(245,240,232,0.5)',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.5)')}
              >
                {siteConfig.email}
              </a>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 300,
                  color: 'rgba(245,240,232,0.5)',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.5)')}
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(201,168,76,0.1)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              color: 'rgba(245,240,232,0.3)',
            }}
          >
            © {new Date().getFullYear()} LookaGraphy — Tous droits réservés
          </span>
          <Link
            href="/mentions-legales"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              color: 'rgba(245,240,232,0.3)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.3)')}
          >
            Mentions légales
          </Link>
          <div className="ornament" style={{ fontSize: '1rem', opacity: 0.3 }}>
            ل ح ب
          </div>
        </div>
      </div>
    </footer>
  );
}
