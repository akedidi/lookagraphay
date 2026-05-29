'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect, useLayoutEffect, useRef, useCallback, type RefObject } from 'react';
import { artistData, ateliersData, expositionsData, evenementsData, galerieData } from '@/lib/data';
import { fadeUp, fadeUpStagger as stagger, motionViewport } from '@/lib/motion-variants';
import { heroVideoLog, isHeroVideoDebugEnabled, snapshotVideo } from '@/lib/hero-video-debug';

function isHeroVideoVisible(video: HTMLVideoElement) {
  const style = window.getComputedStyle(video);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function getActiveHeroVideos(
  desktopRef: RefObject<HTMLVideoElement | null>,
  mobileRef: RefObject<HTMLVideoElement | null>
) {
  return [desktopRef.current, mobileRef.current].filter(
    (v): v is HTMLVideoElement => !!v && isHeroVideoVisible(v)
  );
}

function readPreferHeroSound() {
  try {
    return localStorage.getItem('hero-sound') !== 'off';
  } catch {
    return true;
  }
}

export default function Home() {
  /** UI du bouton son (la balise <video> reste `muted` pour l’autoplay, son via .muted en JS). */
  const [soundOn, setSoundOn] = useState(false);
  const [tagline, setTagline] = useState('');
  const [galeriePreview, setGaleriePreview] = useState(galerieData.slice(0, 6));
  const videoDesktopRef = useRef<HTMLVideoElement>(null);
  const videoMobileRef = useRef<HTMLVideoElement>(null);
  const playLockRef = useRef(false);

  const tryEnableSound = useCallback((video: HTMLVideoElement, reason: string) => {
    if (!readPreferHeroSound() || !video.muted) {
      heroVideoLog('tryEnableSound:skip', { reason, ...snapshotVideo(video, 'target') });
      return;
    }
    heroVideoLog('tryEnableSound:start', { reason, ...snapshotVideo(video, 'target') });
    video.muted = false;
    video
      .play()
      .then(() => {
        heroVideoLog('tryEnableSound:ok', { reason, ...snapshotVideo(video, 'target') });
        setSoundOn(true);
      })
      .catch((err: unknown) => {
        video.muted = true;
        setSoundOn(false);
        heroVideoLog('tryEnableSound:fail', {
          reason,
          err: err instanceof Error ? err.message : String(err),
          ...snapshotVideo(video, 'target'),
        });
      });
  }, []);

  const playHeroVideos = useCallback(async (trigger: string) => {
    if (playLockRef.current) {
      heroVideoLog('play:locked', { trigger });
      return;
    }
    playLockRef.current = true;
    const preferSound = readPreferHeroSound();
    const videos = getActiveHeroVideos(videoDesktopRef, videoMobileRef);

    heroVideoLog('play:start', {
      trigger,
      preferSound,
      debug: isHeroVideoDebugEnabled(),
      desktopRef: !!videoDesktopRef.current,
      mobileRef: !!videoMobileRef.current,
      activeCount: videos.length,
      desktop: videoDesktopRef.current ? snapshotVideo(videoDesktopRef.current, 'desktop') : null,
      mobile: videoMobileRef.current ? snapshotVideo(videoMobileRef.current, 'mobile') : null,
    });

    try {
      if (videos.length === 0) {
        heroVideoLog('play:no-active-video', { trigger });
        return;
      }

      for (const video of videos) {
        const label = video === videoDesktopRef.current ? 'desktop' : 'mobile';
        video.muted = true;
        if (!video.paused) {
          heroVideoLog('play:already-playing', { trigger, ...snapshotVideo(video, label) });
          if (preferSound) tryEnableSound(video, `${trigger}-already-playing`);
          continue;
        }
        try {
          await video.play();
          heroVideoLog('play:ok', { trigger, ...snapshotVideo(video, label) });
        } catch (err: unknown) {
          heroVideoLog('play:fail', {
            trigger,
            err: err instanceof Error ? err.message : String(err),
            ...snapshotVideo(video, label),
          });
          continue;
        }
        if (preferSound) tryEnableSound(video, `${trigger}-after-play`);
      }
      const active = getActiveHeroVideos(videoDesktopRef, videoMobileRef);
      setSoundOn(preferSound && active.some((v) => !v.muted));
      heroVideoLog('play:done', {
        trigger,
        soundOnUi: preferSound && active.some((v) => !v.muted),
        active: active.map((v) => snapshotVideo(v, v === videoDesktopRef.current ? 'desktop' : 'mobile')),
      });
    } finally {
      playLockRef.current = false;
    }
  }, [tryEnableSound]);

  const bindHeroVideoRef = useCallback(
    (which: 'desktop' | 'mobile') => (el: HTMLVideoElement | null) => {
      if (which === 'desktop') videoDesktopRef.current = el;
      else videoMobileRef.current = el;
      heroVideoLog(`ref:${which}`, { attached: !!el, snapshot: el ? snapshotVideo(el, which) : null });
      if (el && isHeroVideoVisible(el)) void playHeroVideos(`ref-${which}`);
    },
    [playHeroVideos]
  );

  useEffect(() => {
    setTagline("Une calligraphie métissée, portant la liberté et l\u2019humanité dans ses traits, ouverte au monde, inclusive et respectueuse de la planète.");
  }, []);

  useEffect(() => {
    fetch('/api/galerie')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGaleriePreview(data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  useLayoutEffect(() => {
    heroVideoLog('mount:layoutEffect', {
      href: typeof window !== 'undefined' ? window.location.href : '',
      visibility: typeof document !== 'undefined' ? document.visibilityState : '',
    });
    void playHeroVideos('layoutEffect');

    const delays = [100, 300, 800, 2000];
    const timers = delays.map((ms) =>
      window.setTimeout(() => void playHeroVideos(`retry-${ms}ms`), ms)
    );

    const resume = (source: string) => {
      const videos = getActiveHeroVideos(videoDesktopRef, videoMobileRef);
      heroVideoLog(`resume:${source}`, {
        count: videos.length,
        paused: videos.map((v) => v.paused),
      });
      if (videos.length === 0 || videos.some((v) => v.paused)) void playHeroVideos(`resume-${source}`);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') resume('visibility');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', () => resume('pageshow'));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [playHeroVideos]);

  async function toggleSound() {
    const nextSound = !soundOn;
    try {
      localStorage.setItem('hero-sound', nextSound ? 'on' : 'off');
    } catch (_) {}

    const videos = getActiveHeroVideos(videoDesktopRef, videoMobileRef);
    for (const video of videos) {
      video.muted = !nextSound;
      if (video.paused) {
        try {
          await video.play();
        } catch {
          video.muted = true;
          setSoundOn(false);
          try {
            localStorage.setItem('hero-sound', 'off');
          } catch (_) {}
          return;
        }
      }
    }
    setSoundOn(nextSound);
  }

  function onHeroVideoEvent(video: HTMLVideoElement, eventName: string) {
    const label = video === videoDesktopRef.current ? 'desktop' : 'mobile';
    heroVideoLog(`event:${eventName}`, snapshotVideo(video, label));
    if (!isHeroVideoVisible(video)) {
      heroVideoLog(`event:${eventName}:hidden`, { label });
      return;
    }
    void playHeroVideos(eventName);
  }

  return (
    <div style={{ background: '#F5F0E8' }}>
      {/* ── HERO VIDEO ── */}
      <section
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          height: '100vh',
          minHeight: 600,
        }}
      >
        {/* Desktop video */}
        <video
          ref={bindHeroVideoRef('desktop')}
          className="hero-video-desktop"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          style={{ zIndex: 0 }}
          onLoadStart={(e) => onHeroVideoEvent(e.currentTarget, 'loadstart')}
          onLoadedMetadata={(e) => onHeroVideoEvent(e.currentTarget, 'loadedmetadata')}
          onLoadedData={(e) => onHeroVideoEvent(e.currentTarget, 'loadeddata')}
          onCanPlay={(e) => onHeroVideoEvent(e.currentTarget, 'canplay')}
          onPlaying={(e) => {
            const v = e.currentTarget;
            heroVideoLog('event:playing', snapshotVideo(v, 'desktop'));
            if (isHeroVideoVisible(v) && readPreferHeroSound()) tryEnableSound(v, 'onPlaying');
          }}
          onPause={(e) => heroVideoLog('event:pause', snapshotVideo(e.currentTarget, 'desktop'))}
          onError={(e) =>
            heroVideoLog('event:error', {
              ...snapshotVideo(e.currentTarget, 'desktop'),
              code: e.currentTarget.error?.code,
            })
          }
        >
          <source src="/videos/video-hero-wide.mp4" type="video/mp4" />
        </video>
        {/* Mobile video */}
        <video
          ref={bindHeroVideoRef('mobile')}
          className="hero-video-mobile"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          style={{ zIndex: 0 }}
          onLoadStart={(e) => onHeroVideoEvent(e.currentTarget, 'loadstart')}
          onLoadedMetadata={(e) => onHeroVideoEvent(e.currentTarget, 'loadedmetadata')}
          onLoadedData={(e) => onHeroVideoEvent(e.currentTarget, 'loadeddata')}
          onCanPlay={(e) => onHeroVideoEvent(e.currentTarget, 'canplay')}
          onPlaying={(e) => {
            const v = e.currentTarget;
            heroVideoLog('event:playing', snapshotVideo(v, 'mobile'));
            if (isHeroVideoVisible(v) && readPreferHeroSound()) tryEnableSound(v, 'onPlaying');
          }}
          onPause={(e) => heroVideoLog('event:pause', snapshotVideo(e.currentTarget, 'mobile'))}
          onError={(e) =>
            heroVideoLog('event:error', {
              ...snapshotVideo(e.currentTarget, 'mobile'),
              code: e.currentTarget.error?.code,
            })
          }
        >
          <source src="/videos/video-hero-vertical.mp4" type="video/mp4" />
        </video>

        {/* Bouton son */}
        <button
          onClick={toggleSound}
          title={soundOn ? 'Couper le son' : 'Activer le son'}
          style={{
            position: 'absolute',
            top: '7rem',
            right: '1.5rem',
            zIndex: 10,
            background: 'rgba(26,18,9,0.45)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#F5F0E8',
            backdropFilter: 'blur(6px)',
            transition: 'background 0.3s, border-color 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.25)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.7)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,18,9,0.45)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.3)';
          }}
        >
          {!soundOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          )}
        </button>

        {/* Fallback gradient when no video */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1A1209 0%, #3D2B1F 40%, #2A2520 100%)',
            zIndex: -1,
          }}
        />

        {/* Overlay */}
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

        {/* Arabic watermark */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(6rem, 20vw, 18rem)',
            color: '#C9A84C',
            opacity: 0.06,
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          ل
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '0 1.5rem', zIndex: 3 }}>
          <h1
            className="hero-title"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(2.8rem, 8vw, 7rem)',
              color: '#F5F0E8',
              letterSpacing: '0.08em',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Looka<span style={{ color: '#C9A84C' }}>Graphy</span>
          </h1>

          <p
            className="hero-tagline"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              color: 'rgba(245,240,232,0.75)',
              letterSpacing: '0.06em',
              marginBottom: '3rem',
              maxWidth: 600,
              margin: '0 auto 3rem',
              minHeight: '2em',
            }}
          >
            {tagline}
          </p>

          <div className="hero-cta" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            <Link href="/galerie" className="btn-gold">
              Découvrir les œuvres
            </Link>
            <Link href="/ateliers" className="btn-gold">
              Rejoindre un atelier
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ zIndex: 3 }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.85rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.75)',
            }}
          >
            Défiler
          </span>
          <div
            style={{
              width: 1,
              height: 48,
              background: 'linear-gradient(to bottom, rgba(201,168,76,0.6), transparent)',
            }}
          />
        </div>
      </section>

      {/* ── INTRO PHRASE ── */}
      <section className="py-24 section-pad text-center" style={{ background: '#1A1209' }}>
        <motion.div
          initial="visible"
          whileInView="visible"
          viewport={motionViewport}
          variants={fadeUp}
        >
          <div className="ornament mb-6" style={{ fontSize: '1.5rem' }}>
            ـ ـ ـ
          </div>
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.2rem, 3vw, 2rem)',
              color: 'rgba(245,240,232,0.8)',
              lineHeight: 1.7,
              maxWidth: 700,
              margin: '0 auto',
              letterSpacing: '0.04em',
            }}
          >
            "Chaque lettre arabe est un univers.
            <br />
            La calligraphie n'est pas une écriture —<br />
            <em style={{ color: '#C9A84C' }}>c'est une danse de l'encre.</em>"
          </p>
          <div className="mt-8" style={{ color: 'rgba(245,240,232,0.84)', fontSize: '0.8rem', letterSpacing: '0.25em', fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase' }}>
            — Looka
          </div>
        </motion.div>
      </section>

      {/* ── L'ARTISTE ── */}
      <section className="py-24 section-pad" style={{ background: '#F5F0E8' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" style={{ maxWidth: '72rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={motionViewport}
            variants={fadeUp}
            className="max-w-xl mx-auto lg:max-w-none lg:mx-0"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1.5rem',
              }}
            >
              L'Artiste
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: '#1A1209',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}
            >
              Looka —<br />
              <em>Calligraphe</em>
            </h2>
            <span className="gold-line" style={{ margin: '0 0 2rem' }} />
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
                fontSize: '0.85rem',
                lineHeight: 1.9,
                color: '#3D2B1F',
                marginBottom: '2rem',
              }}
            >
              {artistData.bio[0]}
            </p>
            <Link href="/artiste" className="btn-gold">
              Découvrir son univers
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 1, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={motionViewport}
            transition={{ duration: 1, ease: 'easeOut' as const }}
            className="img-zoom"
            style={{
              aspectRatio: '3/4',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <img
              src="/images/artiste-portrait-4.jpg"
              alt="Looka — Calligraphe"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '2rem 1.5rem 1.5rem',
                background: 'linear-gradient(to top, rgba(26,18,9,0.65) 0%, transparent 100%)',
              }}
            >
              <div style={{ width: 30, height: 1, background: '#C9A84C', marginBottom: '0.6rem', opacity: 0.6 }} />
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,0.88)',
                }}
              >
                Portrait de l'artiste
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ATELIERS ── */}
      <section className="py-24 section-pad" style={{ background: '#2A2520' }}>
        <div style={{ maxWidth: "72rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={motionViewport}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              Transmission
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                color: '#F5F0E8',
                letterSpacing: '0.05em',
              }}
            >
              Ateliers & Cours
            </h2>
            <span className="gold-line" />
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 300,
                fontSize: '0.8rem',
                lineHeight: 1.8,
                color: 'rgba(245,240,232,0.85)',
                maxWidth: 500,
                margin: '0 auto',
              }}
            >
              Des cours semestriels en petits groupes, pour entrer dans la pratique avec profondeur et patience.
            </p>
          </motion.div>

          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={motionViewport}
            variants={stagger}
            style={{
              maxWidth: '48rem',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {ateliersData.map((atelier) => (
              <motion.div
                key={atelier.id}
                variants={fadeUp}
                style={{
                  border: '1px solid rgba(201,168,76,0.2)',
                  padding: '2.5rem 2rem',
                  position: 'relative',
                  transition: 'border-color 0.3s',
                }}
                whileHover={{ borderColor: 'rgba(201,168,76,0.5)' }}
              >
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.85rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    display: 'block',
                    marginBottom: '1rem',
                  }}
                >
                  {atelier.semestre} · {atelier.niveau}
                </span>
                <h3
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: 400,
                    fontSize: '1.3rem',
                    color: '#F5F0E8',
                    letterSpacing: '0.03em',
                    marginBottom: '1rem',
                    lineHeight: 1.3,
                  }}
                >
                  {atelier.titre}
                </h3>
                <div style={{ width: 30, height: 1, background: 'rgba(201,168,76,0.4)', marginBottom: '1rem' }} />
                <p
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 300,
                    lineHeight: 1.7,
                    color: 'rgba(245,240,232,0.82)',
                    marginBottom: '1.5rem',
                  }}
                >
                  {atelier.horaires}
                  <br />
                  {atelier.lieu}
                </p>
              </motion.div>
            ))}
            {/* Carte contact */}
            <motion.div
              variants={fadeUp}
              style={{
                border: '1px solid rgba(201,168,76,0.1)',
                padding: '2.5rem 2rem',
                background: 'rgba(201,168,76,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontSize: '1.15rem',
                  color: 'rgba(245,240,232,0.85)',
                  lineHeight: 1.6,
                }}
              >
                Un moment de méditation et de créativité joyeuse.
              </p>
              <Link href="/ateliers" className="btn-gold" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                En savoir plus
              </Link>
            </motion.div>
          </motion.div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/ateliers" className="btn-gold">
              Voir tous les ateliers
            </Link>
          </div>
        </div>
      </section>

      {/* ── GALERIE PREVIEW ── */}
      <section className="py-24 section-pad" style={{ background: '#F5F0E8' }}>
        <div style={{ maxWidth: "72rem", marginLeft: "auto", marginRight: "auto" }}>
          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={motionViewport}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              Création
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                color: '#1A1209',
                letterSpacing: '0.05em',
              }}
            >
              Œuvres récentes
            </h2>
            <span className="gold-line" />
          </motion.div>

          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={motionViewport}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
          >
            {galeriePreview.map((oeuvre, i) => (
              <motion.div
                key={oeuvre.id}
                variants={fadeUp}
                className="img-zoom"
                style={{
                  aspectRatio: i % 3 === 1 ? '3/4' : '1/1',
                  background: '#1A1209',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.4 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={oeuvre.image}
                  alt={oeuvre.titre}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1rem',
                    background: 'linear-gradient(to top, rgba(26,18,9,0.88) 0%, rgba(26,18,9,0.2) 55%, transparent 100%)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '0.95rem',
                      color: '#F5F0E8',
                      letterSpacing: '0.04em',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {oeuvre.titre}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center">
            <Link href="/store" className="btn-gold">
              Accéder au Store
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXPOSITIONS ── */}
      <section className="py-24 section-pad" style={{ background: '#1A1209' }}>
        <div style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <motion.div
            initial="visible"
            whileInView="visible"
            viewport={motionViewport}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              Expositions
            </span>
            <h2
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                color: '#F5F0E8',
                letterSpacing: '0.05em',
              }}
            >
              Prochainement
            </h2>
            <span className="gold-line" />
          </motion.div>

          {expositionsData
            .filter((e) => e.statut === 'à venir')
            .map((expo, i) => (
              <motion.div
                key={expo.id}
                initial="visible"
                whileInView="visible"
                viewport={motionViewport}
                variants={fadeUp}
                className="page-article-grid-1-3"
                style={{
                  borderTop: '1px solid rgba(201,168,76,0.15)',
                  padding: '2.5rem 0',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.85rem',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {expo.statut}
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 400,
                      fontSize: '1.6rem',
                      color: '#F5F0E8',
                      letterSpacing: '0.03em',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {expo.titre}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.8rem',
                      letterSpacing: '0.15em',
                      color: '#C9A84C',
                      marginBottom: '1rem',
                    }}
                  >
                    {expo.lieu}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 300,
                      lineHeight: 1.7,
                      color: 'rgba(245,240,232,0.82)',
                    }}
                  >
                    {expo.description}
                  </p>
                </div>
              </motion.div>
            ))}

          <div className="text-center mt-12">
            <Link href="/expositions" className="btn-gold">
              Toutes les expositions
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section
        style={{
          background: '#3D2B1F',
          padding: '5rem clamp(1.5rem, 5vw, 4rem)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(10rem, 30vw, 24rem)',
              color: '#C9A84C',
              opacity: 0.04,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            لـ
          </div>
        </div>
        <motion.div
          initial="visible"
          whileInView="visible"
          viewport={motionViewport}
          variants={fadeUp}
          style={{ zIndex: 1, position: 'relative' }}
        >
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              color: '#F5F0E8',
              letterSpacing: '0.06em',
              marginBottom: '1.5rem',
              lineHeight: 1.3,
            }}
          >
            Envie d'entrer dans l'art<br />
            <em style={{ color: '#C9A84C' }}>de la calligraphie arabe ?</em>
          </h2>
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
              fontSize: '0.8rem',
              color: 'rgba(245,240,232,0.85)',
              lineHeight: 1.8,
              maxWidth: 450,
              margin: '0 auto 2.5rem',
            }}
          >
            Rejoignez un atelier, acquérez une œuvre ou prenez contact pour un projet unique.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            <Link href="/ateliers" className="btn-gold">
              Rejoindre un atelier
            </Link>
            <Link href="/contact" className="btn-gold">
              Nous écrire
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
