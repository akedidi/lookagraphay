export type Matiere = 'argent' | 'or';
export type Quantite = 'unite' | 'paire';

const TARIFS: Record<string, (m: Matiere, q?: Quantite) => number> = {
  Pendentif: (m) => (m === 'argent' ? 70 : 80),
  Bague: (m) => (m === 'argent' ? 80 : 90),
  "Boucles d'oreilles": (m, q) => {
    if (m === 'argent') return q === 'paire' ? 120 : 75;
    return q === 'paire' ? 130 : 85;
  },
};

export function isBijouCategory(categorie: string): boolean {
  return categorie in TARIFS;
}

export function parseMatiere(matiere?: string | null): Matiere {
  if (!matiere) return 'argent';
  const lower = matiere.toLowerCase();
  if (lower.includes('or')) return 'or';
  return 'argent';
}

export function parseQuantite(quantiteLabel?: string | null): Quantite {
  if (!quantiteLabel) return 'paire';
  if (quantiteLabel.toLowerCase().includes('paire')) return 'paire';
  return 'unite';
}

export function calcBijouBasePrice(
  categorie: string,
  matiere: Matiere,
  quantite: Quantite
): number {
  const fn = TARIFS[categorie];
  if (!fn) return 0;
  return fn(matiere, quantite);
}
