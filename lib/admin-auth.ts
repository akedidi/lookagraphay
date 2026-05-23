/**
 * Session admin signée (HMAC-SHA256) — compatible Edge (middleware) et Node (API).
 */

import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'lookagraphy_admin';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

const textEncoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET requis en production (min. 16 caractères)');
  }
  return 'dev-only-admin-session-secret';
}

export function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length >= 8) return pw;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD requis en production (min. 8 caractères)');
  }
  return 'dev-admin-change-me';
}

export function verifyAdminPassword(password: string): boolean {
  return timingSafeEqualStr(password, getAdminPassword());
}

async function hmacSign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

export async function createAdminSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_MS, v: 1 });
  const payloadB64 = toBase64Url(textEncoder.encode(payload));
  const sig = await hmacSign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = await hmacSign(payloadB64);
  if (!timingSafeEqualStr(sig, expectedSig)) return false;
  try {
    const json = new TextDecoder().decode(fromBase64Url(payloadB64));
    const data = JSON.parse(json) as { exp?: number; v?: number };
    return data.v === 1 && typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function getAdminTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(ADMIN_COOKIE)?.value;
}

export async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
  return verifyAdminSessionToken(getAdminTokenFromRequest(req));
}

export async function setAdminSessionCookie(res: NextResponse): Promise<void> {
  const token = await createAdminSessionToken();
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_MS / 1000),
  });
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  return null;
}

/** Routes API mutantes à protéger (middleware + handlers). */
export function apiRouteRequiresAdmin(pathname: string, method: string): boolean {
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') return false;
  if (pathname === '/api/admin/session') return false;
  if (pathname.startsWith('/api/admin/')) return true;

  if (pathname === '/api/orders' && method === 'GET') return true;
  if (/^\/api\/orders\/[^/]+$/.test(pathname) && method === 'PUT') return true;

  if (pathname === '/api/store' && method === 'POST') return true;
  if (/^\/api\/store\/[^/]+$/.test(pathname) && (method === 'PUT' || method === 'DELETE')) return true;

  if (pathname === '/api/expositions' && method === 'POST') return true;
  if (/^\/api\/expositions\/[^/]+$/.test(pathname) && (method === 'PUT' || method === 'DELETE')) return true;

  if (pathname === '/api/evenements' && method === 'POST') return true;
  if (/^\/api\/evenements\/[^/]+$/.test(pathname) && (method === 'PUT' || method === 'DELETE')) return true;

  return false;
}
