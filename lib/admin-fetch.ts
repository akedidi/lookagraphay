/** Options fetch pour les appels admin authentifiés (cookie httpOnly). */
export const adminFetchInit: RequestInit = {
  credentials: 'include',
};

export function adminJsonInit(body?: unknown): RequestInit {
  return {
    ...adminFetchInit,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };
}
