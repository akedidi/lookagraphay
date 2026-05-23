import { computePromoPrice, type PromoInput, type PromoResult } from '@/lib/promo';

export type StoreItemRow = Record<string, unknown>;

export type MappedStoreItem = {
  id: number;
  titre: string;
  sous_titre?: string | null;
  categorie: string;
  description?: string | null;
  citation?: string | null;
  technique?: string | null;
  dimensions?: string | null;
  annee?: string | null;
  prix: number;
  prix_promo: number;
  promo_active: boolean;
  promo: PromoResult;
  promo_enabled: boolean;
  promo_type: string | null;
  promo_value: number | null;
  promo_start: string | null;
  promo_end: string | null;
  images: string[];
  disponible: boolean;
  in_galerie: boolean;
  paypal_link?: string | null;
  ordre?: number;
  style?: string | null;
  extrait?: string | null;
};

export function mapStoreItemFromRow(row: StoreItemRow): MappedStoreItem {
  const prix = Number(row.prix ?? 0);
  const promoInput: PromoInput = {
    prix,
    promo_enabled: row.promo_enabled === 1 || row.promo_enabled === true,
    promo_type: row.promo_type as PromoInput['promo_type'],
    promo_value: row.promo_value != null ? Number(row.promo_value) : null,
    promo_start: row.promo_start ? String(row.promo_start) : null,
    promo_end: row.promo_end ? String(row.promo_end) : null,
  };
  const promo = computePromoPrice(prix, promoInput);

  return {
    id: Number(row.id),
    titre: String(row.titre ?? ''),
    sous_titre: row.sous_titre ? String(row.sous_titre) : null,
    categorie: String(row.categorie ?? 'Tableau'),
    description: row.description ? String(row.description) : null,
    citation: row.citation ? String(row.citation) : null,
    technique: row.technique ? String(row.technique) : null,
    dimensions: row.dimensions ? String(row.dimensions) : null,
    annee: row.annee ? String(row.annee) : null,
    prix,
    prix_promo: promo.final,
    promo_active: promo.active,
    promo,
    promo_enabled: promoInput.promo_enabled ?? false,
    promo_type: promoInput.promo_type ? String(promoInput.promo_type) : null,
    promo_value: promoInput.promo_value ?? null,
    promo_start: promoInput.promo_start ? String(promoInput.promo_start) : null,
    promo_end: promoInput.promo_end ? String(promoInput.promo_end) : null,
    images:
      typeof row.images === 'string'
        ? (JSON.parse(row.images) as string[])
        : Array.isArray(row.images)
          ? (row.images as string[])
          : [],
    disponible: row.disponible === 1 || row.disponible === true,
    in_galerie: row.in_galerie === 1 || row.in_galerie === true,
    paypal_link: row.paypal_link ? String(row.paypal_link) : null,
    ordre: row.ordre != null ? Number(row.ordre) : 0,
    style: row.style ? String(row.style) : null,
    extrait: row.extrait ? String(row.extrait) : null,
  };
}

export function resolvePriceForBase(item: PromoInput, basePrice: number) {
  return computePromoPrice(basePrice, { ...item, prix: basePrice });
}

/** Pour formulaires admin : datetime-local ← valeur MySQL */
export function toDatetimeLocalValue(mysqlDt: string | null | undefined): string {
  if (!mysqlDt) return '';
  const d = new Date(String(mysqlDt).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string | null | undefined): string | null {
  if (!value || !String(value).trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}
