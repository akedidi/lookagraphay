export const CONTACT_MOTIFS = [
  { value: 'atelier', label: 'Inscription à un atelier' },
  { value: 'achat', label: "Achat d'une œuvre" },
  { value: 'commande', label: 'Commande sur mesure' },
  { value: 'exposition', label: "Proposition d'exposition" },
  { value: 'collaboration', label: 'Collaboration / Partenariat' },
  { value: 'presse', label: 'Presse / Médias' },
  { value: 'autre', label: 'Autre demande' },
] as const;

export type ContactMotifValue = (typeof CONTACT_MOTIFS)[number]['value'];

export function getContactMotifLabel(value: string): string | null {
  return CONTACT_MOTIFS.find((m) => m.value === value)?.label ?? null;
}

export function isValidContactMotif(value: string): value is ContactMotifValue {
  return CONTACT_MOTIFS.some((m) => m.value === value);
}
