export const HERO_GESTURE_KEY = 'hero-user-gesture';
export const HERO_SOUND_KEY = 'hero-sound';

export function isMobileHeroViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}

export function hasHeroUserGesture(): boolean {
  if (typeof window === 'undefined' || isMobileHeroViewport()) return false;
  try {
    return sessionStorage.getItem(HERO_GESTURE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markHeroUserGesture(): void {
  if (typeof window === 'undefined' || isMobileHeroViewport()) return;
  try {
    sessionStorage.setItem(HERO_GESTURE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function readPreferHeroSoundFromStorage(): boolean {
  if (typeof window === 'undefined') return true;
  if (isMobileHeroViewport()) return false;
  try {
    const v = localStorage.getItem(HERO_SOUND_KEY);
    if (v === null) return true;
    return v !== 'off';
  } catch {
    return true;
  }
}

/** Desktop : 1ère interaction + préférence son non désactivée. */
export function shouldAttemptHeroSoundAuto(): boolean {
  return !isMobileHeroViewport() && hasHeroUserGesture() && readPreferHeroSoundFromStorage();
}
