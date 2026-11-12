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

/** Prix catalogue par défaut : T-shirt 50 €, Sweat-shirt 65 €. */
export const DEFAULT_TSHIRT_PRIX = 50;
export const DEFAULT_SWEATSHIRT_PRIX = 65;

export type ApparelOptions = {
  tshirt_prix: number;
  sweatshirt_prix: number;
  /** Afficher l'option T-shirt côté boutique (défaut true). */
  tshirt_enabled: boolean;
  /** Afficher l'option Sweat-shirt côté boutique (défaut true). */
  sweatshirt_enabled: boolean;
  /** Tailles proposées au client (défaut toutes). */
  sizes: ApparelSize[];
};

function normalizeSizes(raw: unknown): ApparelSize[] {
  if (!Array.isArray(raw) || raw.length === 0) return [...APPAREL_SIZES];
  const parsed = raw
    .map((s) => String(s).replace(/^taille\s+/i, '').trim().toUpperCase())
    .filter((s): s is ApparelSize => (APPAREL_SIZES as readonly string[]).includes(s));
  return parsed.length > 0 ? parsed : [...APPAREL_SIZES];
}

export function defaultApparelOptions(_fallbackPrix = 0): ApparelOptions {
  return {
    tshirt_prix: DEFAULT_TSHIRT_PRIX,
    sweatshirt_prix: DEFAULT_SWEATSHIRT_PRIX,
    tshirt_enabled: true,
    sweatshirt_enabled: true,
    sizes: [...APPAREL_SIZES],
  };
}

export function parseApparelOptions(
  value: unknown,
  _fallbackPrix = DEFAULT_TSHIRT_PRIX
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
      tshirt_enabled: raw.tshirt_enabled !== false,
      sweatshirt_enabled: raw.sweatshirt_enabled !== false,
      sizes: normalizeSizes(raw.sizes),
    };
  } catch {
    return null;
  }
}

export function isBijouStoreCategory(categorie: string): boolean {
  return (BIJOU_CATEGORIES as readonly string[]).includes(categorie);
}

export function isApparelCategory(categorie: string): boolean {
  return categorie === APPAREL_CATEGORY;
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

export function apparelEnabledTypes(options: ApparelOptions | null | undefined): ApparelType[] {
  const opts = options ?? defaultApparelOptions();
  const types: ApparelType[] = [];
  if (opts.tshirt_enabled) types.push('tshirt');
  if (opts.sweatshirt_enabled) types.push('sweatshirt');
  return types.length > 0 ? types : ['tshirt'];
}

export function apparelEnabledSizes(options: ApparelOptions | null | undefined): ApparelSize[] {
  const opts = options ?? defaultApparelOptions();
  return opts.sizes.length > 0 ? opts.sizes : [...APPAREL_SIZES];
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

/** Prix catalogue affiché en grille (le plus bas des options activées). */
export function apparelDisplayBasePrice(
  options: ApparelOptions | null | undefined,
  fallbackPrix = 0
): number {
  if (!options) return fallbackPrix || DEFAULT_TSHIRT_PRIX;
  const prices: number[] = [];
  if (options.tshirt_enabled && options.tshirt_prix > 0) prices.push(options.tshirt_prix);
  if (options.sweatshirt_enabled && options.sweatshirt_prix > 0) prices.push(options.sweatshirt_prix);
  if (prices.length === 0) {
    if (options.tshirt_prix > 0) prices.push(options.tshirt_prix);
    if (options.sweatshirt_prix > 0) prices.push(options.sweatshirt_prix);
  }
  if (prices.length === 0) return fallbackPrix || DEFAULT_TSHIRT_PRIX;
  return Math.min(...prices);
}
