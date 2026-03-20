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
      <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', padding: '0 1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
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
                fontSize: '0.75rem',
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
                color: 'rgba(245,240,232,0.82)',
                maxWidth: '260px',
              }}
            >
              Atelier de calligraphie arabe à Paris.<br />
              Création, enseignement, transmission.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '1.5rem',
              }}
            >
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`mailto:${siteConfig.email}`}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: 300,
                  color: 'rgba(245,240,232,0.82)',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.82)')}
              >
                {siteConfig.email}
              </a>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: 300,
                  color: 'rgba(245,240,232,0.82)',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.82)')}
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
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: 'rgba(245,240,232,0.7)',
            }}
          >
            © {new Date().getFullYear()} LookaGraphy — Tous droits réservés
          </span>
          <Link
            href="/mentions-legales"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: 'rgba(245,240,232,0.7)',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,0.7)')}
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
