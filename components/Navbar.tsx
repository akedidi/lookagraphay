'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/artiste', label: "L'Artiste" },
  { href: '/ateliers', label: 'Ateliers' },
  { href: '/expositions', label: 'Expositions' },
  { href: '/evenements', label: 'Événements' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/store', label: 'Store' },
  { href: '/contact', label: 'Contact' },
];

function useTransparentLogo(src: string): string {
  const [dataUrl, setDataUrl] = useState(src);
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const brightness = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
        d[i] = 245; d[i + 1] = 240; d[i + 2] = 232;
        d[i + 3] = brightness;
      }
      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = src;
  }, [src]);
  return dataUrl;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoSrc = useTransparentLogo('/images/logo.png');

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
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="LookaGraphy" width={44} height={44} style={{ display: 'block', flexShrink: 0 }} />
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
                  fontSize: '0.52rem',
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

          {/* Desktop nav */}
          <ul
            className="hidden lg:flex items-center"
            style={{ gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 }}
          >
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="nav-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile burger */}
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
        <img src={logoSrc} alt="LookaGraphy" width={60} height={60} style={{ display: 'block', opacity: 0.4, marginBottom: '2rem' }} />
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
