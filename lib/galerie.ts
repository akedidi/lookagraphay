/** Mappe une ligne store_items vers le format attendu par la page Galerie. */

import { getStoreItemDisplayPrice, mapStoreItemFromRow } from '@/lib/store-item';

export type GalerieOeuvre = {
  id: string;
  titre: string;
  sousTitre?: string;
  technique?: string;
  dimensions?: string;
  annee?: string;
  style: string;
  categorie?: string;
  disponible: boolean;
  prix?: number;
  prix_promo?: number;
  promo_active?: boolean;
  promo_label?: string | null;
  image: string;
  images?: string[];
  extrait?: string;
  citation?: string;
  description?: string;
};

export function mapStoreRowToGalerieOeuvre(row: Record<string, unknown>): GalerieOeuvre {
  const item = mapStoreItemFromRow(row);
  const display = getStoreItemDisplayPrice(item);
  const image = item.images[0] ?? '';

  return {
    id: String(item.id),
    titre: item.titre,
    sousTitre: item.sous_titre ?? undefined,
    technique: item.technique ?? undefined,
    dimensions: item.dimensions ?? undefined,
    annee: item.annee ?? undefined,
    style: item.style ?? 'Calligraphie contemporaine',
    categorie: item.categorie,
    disponible: item.disponible,
    prix: display.original > 0 ? display.original : undefined,
    prix_promo: display.final,
    promo_active: display.active,
    promo_label: display.label,
    image,
    images: item.images.length ? item.images : image ? [image] : [],
    extrait: item.extrait ?? undefined,
    citation: item.citation ?? undefined,
    description: item.description ?? undefined,
  };
}
