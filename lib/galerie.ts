/** Mappe une ligne store_items vers le format attendu par la page Galerie. */

export type GalerieOeuvre = {
  id: string;
  titre: string;
  sousTitre?: string;
  technique?: string;
  dimensions?: string;
  annee?: string;
  style: string;
  disponible: boolean;
  prix?: number;
  image: string;
  images?: string[];
  extrait?: string;
  citation?: string;
  description?: string;
};

export function mapStoreRowToGalerieOeuvre(row: Record<string, unknown>): GalerieOeuvre {
  const images =
    typeof row.images === 'string'
      ? (JSON.parse(row.images) as string[])
      : Array.isArray(row.images)
        ? (row.images as string[])
        : [];
  const image = images[0] ?? '';

  return {
    id: String(row.id),
    titre: String(row.titre ?? ''),
    sousTitre: row.sous_titre ? String(row.sous_titre) : undefined,
    technique: row.technique ? String(row.technique) : undefined,
    dimensions: row.dimensions ? String(row.dimensions) : undefined,
    annee: row.annee ? String(row.annee) : undefined,
    style: row.style ? String(row.style) : 'Calligraphie contemporaine',
    disponible: row.disponible === 1 || row.disponible === true,
    prix: row.prix != null ? Number(row.prix) : undefined,
    image,
    images: images.length ? images : image ? [image] : [],
    extrait: row.extrait ? String(row.extrait) : undefined,
    citation: row.citation ? String(row.citation) : undefined,
    description: row.description ? String(row.description) : undefined,
  };
}
