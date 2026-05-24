'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const gold = '#C9A84C';
const dark = '#1A1209';
const sand = '#F5F0E8';

function UnsubscribeContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de désinscription invalide.');
      return;
    }

    setStatus('loading');
    fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus('error');
          setMessage(typeof data.error === 'string' ? data.error : 'Impossible de traiter votre demande.');
          return;
        }
        setStatus('done');
        setMessage('Vous ne recevrez plus la lettre d\'information LookaGraphy.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Erreur réseau. Réessayez plus tard ou contactez-nous.');
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: sand,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 1.5rem 3rem',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: '#FAF7F2',
          border: '1px solid rgba(61,43,31,0.08)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: gold, opacity: 0.5, marginBottom: '1rem' }}>
          ◆
        </div>
        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 300,
            fontSize: '1.75rem',
            color: dark,
            marginBottom: '1rem',
          }}
        >
          {status === 'loading' ? 'Traitement…' : status === 'done' ? 'Désinscription confirmée' : 'Désinscription'}
        </h1>
        <p
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 300,
            color: 'rgba(61,43,31,0.75)',
            lineHeight: 1.8,
            marginBottom: '2rem',
          }}
        >
          {status === 'loading' ? 'Un instant, nous mettons à jour vos préférences…' : message}
        </p>
        <Link
          href="/"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: dark,
            background: gold,
            padding: '0.85rem 1.75rem',
            textDecoration: 'none',
          }}
        >
          Retour au site
        </Link>
      </div>
    </div>
  );
}

export default function DesabonnementPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: sand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: dark }}>Chargement…</span>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
