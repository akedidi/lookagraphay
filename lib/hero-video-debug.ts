/** Logs hero video — actif en dev et sur lookagraphy.fr / Hostinger (debug prod). */
const PROD_DEBUG_HOSTS = /(^|\.)lookagraphy\.fr$|hostingersite\.com$/i;

export function isHeroVideoDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_HERO_VIDEO_DEBUG === '0') return false;
  if (process.env.NEXT_PUBLIC_HERO_VIDEO_DEBUG === '1') return true;
  if (process.env.NODE_ENV === 'development') return true;

  if (typeof window === 'undefined') return false;

  try {
    if (PROD_DEBUG_HOSTS.test(window.location.hostname)) return true;
    if (new URLSearchParams(window.location.search).has('heroVideoDebug')) return true;
    if (localStorage.getItem('hero-video-debug') === '1') return true;
  } catch {
    /* ignore */
  }
  return false;
}

let debugBannerShown = false;

export function heroVideoLog(event: string, data?: Record<string, unknown>) {
  if (!isHeroVideoDebugEnabled()) return;
  if (!debugBannerShown && typeof window !== 'undefined') {
    debugBannerShown = true;
    console.info(
      '%c[hero-video] Debug PROD actif',
      'color:#c9a84c;font-weight:bold',
      '— filtrez la console sur « hero-video ». Désactiver : NEXT_PUBLIC_HERO_VIDEO_DEBUG=0 dans hPanel.'
    );
  }
  const ts = new Date().toISOString().slice(11, 23);
  if (data) console.log(`[hero-video ${ts}] ${event}`, data);
  else console.log(`[hero-video ${ts}] ${event}`);
}

export function snapshotVideo(video: HTMLVideoElement, label: string) {
  let display = '';
  let visible = false;
  if (typeof window !== 'undefined') {
    const style = window.getComputedStyle(video);
    display = style.display;
    visible = display !== 'none' && style.visibility !== 'hidden';
  }
  return {
    label,
    paused: video.paused,
    muted: video.muted,
    readyState: video.readyState,
    networkState: video.networkState,
    currentTime: Math.round(video.currentTime * 100) / 100,
    visible,
    display,
    error: video.error?.code ?? null,
    src: video.currentSrc ? video.currentSrc.slice(-48) : '(vide)',
  };
}
