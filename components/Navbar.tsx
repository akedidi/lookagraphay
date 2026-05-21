'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/artiste', label: "L'Artiste" },
  { href: '/association', label: 'Association' },
  { href: '/ateliers', label: 'Ateliers' },
  { href: '/expositions', label: 'Expositions' },
  { href: '/evenements', label: 'Événements' },
  { href: '/store', label: 'Store' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsOpen: openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        style={{
          background: scrolled
            ? 'rgba(26, 18, 9, 0.97)'
            : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          padding: scrolled ? '1rem 0' : '1.5rem 0',
        }}
      >
        <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none', flexShrink: 0, zIndex: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="LookaGraphy" width={44} height={44} style={{ display: 'block', flexShrink: 0 }} />
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.35rem',
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  color: '#F5F0E8',
                  lineHeight: 1,
                }}
              >
                LookaGraphy
              </span>
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.62rem',
                  fontWeight: 400,
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                  marginTop: '3px',
                }}
              >
                Calligraphie Arabe
              </span>
            </div>
          </Link>

          {/* Desktop nav — centré absolument */}
          <ul
            className="hidden lg:flex items-center"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              gap: '0',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="nav-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Cart icon + Mobile burger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
          <button
            onClick={() => openCart(true)}
            aria-label="Panier"
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                background: '#C9A84C', color: '#1A1209',
                borderRadius: '50%', width: 17, height: 17,
                fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: '#C9A84C',
                transform: menuOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
              }}
            />
            <span
              className="block w-4 h-px transition-all duration-300"
              style={{
                background: '#C9A84C',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: '#C9A84C',
                transform: menuOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
              }}
            />
          </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center transition-all duration-500"
        style={{
          background: 'rgba(26, 18, 9, 0.98)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="LookaGraphy" width={60} height={60} style={{ display: 'block', marginBottom: '2rem' }} />
        <ul className="flex flex-col items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="nav-link"
                style={{ fontSize: '0.85rem', letterSpacing: '0.3em' }}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
