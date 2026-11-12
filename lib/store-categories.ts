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

/** Un même visuel : options T-shirt / Sweat-shirt (prix distincts) + taille (même prix). */
export const APPAREL_CATEGORY = 'T-shirts et sweat-shirts';

export const APPAREL_TYPES = ['tshirt', 'sweatshirt'] as const;
export type ApparelType = (typeof APPAREL_TYPES)[number];

export const APPAREL_TYPE_LABELS: Record<ApparelType, string> = {
  tshirt: 'T-shirt',
  sweatshirt: 'Sweat-shirt',
};

export const APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
export type ApparelSize = (typeof APPAREL_SIZES)[number];

export type ApparelOptions = {
  tshirt_prix: number;
  sweatshirt_prix: number;
};

export function isBijouStoreCategory(categorie: string): boolean {
  return (BIJOU_CATEGORIES as readonly string[]).includes(categorie);
}

export function isApparelCategory(categorie: string): boolean {
  return categorie === APPAREL_CATEGORY;
}

/** Prix catalogue par défaut : T-shirt 50 €, Sweat-shirt 65 €. */
export const DEFAULT_TSHIRT_PRIX = 50;
export const DEFAULT_SWEATSHIRT_PRIX = 65;

export function defaultApparelOptions(_fallbackPrix = 0): ApparelOptions {
  return {
    tshirt_prix: DEFAULT_TSHIRT_PRIX,
    sweatshirt_prix: DEFAULT_SWEATSHIRT_PRIX,
  };
}

export function parseApparelOptions(
  value: unknown,
  fallbackPrix = DEFAULT_TSHIRT_PRIX
): ApparelOptions | null {
  if (!value) return null;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== 'object') return null;
    const raw = parsed as Record<string, unknown>;
    const tshirt = Number(raw.tshirt_prix);
    const sweat = Number(raw.sweatshirt_prix);
    return {
      tshirt_prix: Number.isFinite(tshirt) && tshirt > 0 ? tshirt : DEFAULT_TSHIRT_PRIX,
      sweatshirt_prix:
        Number.isFinite(sweat) && sweat > 0 ? sweat : DEFAULT_SWEATSHIRT_PRIX,
    };
  } catch {
    return null;
  }
}

export function apparelTypeLabel(type: ApparelType): string {
  return APPAREL_TYPE_LABELS[type];
}

export function parseApparelType(value?: string | null): ApparelType | null {
  if (!value) return null;
  const lower = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (lower.includes('sweat')) return 'sweatshirt';
  if (lower.includes('t-shirt') || lower.includes('tshirt') || lower === 'tee') return 'tshirt';
  return null;
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

export function apparelBasePrice(
  options: ApparelOptions | null | undefined,
  type: ApparelType,
  fallbackPrix = 0
): number {
  if (!options) return fallbackPrix;
  const price = type === 'tshirt' ? options.tshirt_prix : options.sweatshirt_prix;
  return Number.isFinite(price) ? price : fallbackPrix;
}

/** Prix catalogue affiché en grille (le plus bas des deux options). */
export function apparelDisplayBasePrice(
  options: ApparelOptions | null | undefined,
  fallbackPrix = 0
): number {
  if (!options) return fallbackPrix;
  const prices = [options.tshirt_prix, options.sweatshirt_prix].filter(
    (p) => Number.isFinite(p) && p > 0
  );
  if (prices.length === 0) return fallbackPrix;
  return Math.min(...prices);
}
