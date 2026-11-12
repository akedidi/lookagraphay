/** Catégories boutique (admin + front). */
export const STORE_CATEGORIES = [
  'Tableau',
  'Bague',
  "Boucles d'oreilles",
  'Pendentif',
  'T-shirts et sweat-shirts',
  'Totebags',
  'Mugs',
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];

export const BIJOU_CATEGORIES = ['Bague', "Boucles d'oreilles", 'Pendentif'] as const;

/** Catégorie textile avec sélection de taille. */
export const APPAREL_CATEGORY = 'T-shirts et sweat-shirts';

export const APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
export type ApparelSize = (typeof APPAREL_SIZES)[number];

export function isBijouStoreCategory(categorie: string): boolean {
  return (BIJOU_CATEGORIES as readonly string[]).includes(categorie);
}

export function isApparelCategory(categorie: string): boolean {
  return categorie === APPAREL_CATEGORY;
}

/** Normalise « Taille M », « m », « M » → « M ». */
export function parseApparelSize(value?: string | null): ApparelSize | null {
  if (!value) return null;
  const normalized = value.replace(/^taille\s+/i, '').trim().toUpperCase();
  if ((APPAREL_SIZES as readonly string[]).includes(normalized)) {
    return normalized as ApparelSize;
  }
  return null;
}

export function apparelSizeLabel(size: ApparelSize): string {
  return `Taille ${size}`;
}
