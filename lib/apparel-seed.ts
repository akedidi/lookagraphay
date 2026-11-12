import type { PoolConnection } from 'mysql2/promise';
import {
  APPAREL_CATEGORY,
  DEFAULT_SWEATSHIRT_PRIX,
  DEFAULT_TSHIRT_PRIX,
} from '@/lib/store-categories';

/** Collection vêtements (1 visuel = 1 article, options T-shirt / Sweat-shirt). */
export const APPAREL_SEED_ITEMS = [
  {
    titre: 'L’art est vie — الفن حياة',
    sous_titre: 'L’art est vie',
    description:
      'Calligraphie blanche sur fond noir : « L’art est vie » (الفن حياة). Un même visuel proposé en T-shirt ou Sweat-shirt, tailles S à XXL.',
    citation: 'الفن حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/fann-hayat.jpg'],
    ordre: 100,
  },
  {
    titre: 'Le cinéma est vie — السينما حياة',
    sous_titre: 'Le cinéma est vie',
    description:
      'Calligraphie « Le cinéma est vie » (السينما حياة) en blanc sur noir. Options T-shirt / Sweat-shirt, tailles S–XXL.',
    citation: 'السينما حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/cinema-hayat.jpg'],
    ordre: 101,
  },
  {
    titre: 'La calligraphie est vie — الخط حياة',
    sous_titre: 'La calligraphie est vie',
    description:
      'Calligraphie « La calligraphie est vie » (الخط حياة). Disponible en T-shirt ou Sweat-shirt ; prix selon le modèle, tailles au même tarif.',
    citation: 'الخط حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/khadija.jpg'],
    ordre: 102,
  },
  {
    titre: 'La musique est vie — الموسيقى حياة',
    sous_titre: 'La musique est vie',
    description:
      'Calligraphie « La musique est vie » (الموسيقى حياة), avec une clé de sol intégrée au trait. T-shirt 50 € / Sweat-shirt 65 €.',
    citation: 'الموسيقى حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/musiqa-hayat.jpg'],
    ordre: 103,
  },
  {
    titre: 'La peinture est vie — الرسم حياة',
    sous_titre: 'La peinture est vie',
    description:
      'Calligraphie « La peinture est vie » (الرسم حياة). Un visuel, deux modèles (T-shirt ou Sweat-shirt), tailles S–XXL.',
    citation: 'الرسم حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/rasma-hayat.jpg'],
    ordre: 104,
  },
  {
    titre: 'Le théâtre est vie — المسرح حياة',
    sous_titre: 'Le théâtre est vie',
    description:
      'Calligraphie « Le théâtre est vie » (المسرح حياة). Disponible en T-shirt et Sweat-shirt ; les tailles ne changent pas le prix.',
    citation: 'المسرح حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/masrah-hayat.jpg'],
    ordre: 105,
  },
] as const;

export function apparelSeedPayload(item: (typeof APPAREL_SEED_ITEMS)[number]) {
  return {
    titre: item.titre,
    sous_titre: item.sous_titre,
    categorie: APPAREL_CATEGORY,
    description: item.description,
    citation: item.citation,
    technique: item.technique,
    dimensions: item.dimensions,
    annee: item.annee,
    prix: DEFAULT_TSHIRT_PRIX,
    images: [...item.images],
    disponible: true,
    paypal_link: null,
    ordre: item.ordre,
    style: 'Calligraphie contemporaine',
    extrait: item.citation,
    in_galerie: false,
    promo_enabled: false,
    promo_type: null,
    promo_value: null,
    promo_start: null,
    promo_end: null,
    stock_options: null,
    apparel_options: {
      tshirt_prix: DEFAULT_TSHIRT_PRIX,
      sweatshirt_prix: DEFAULT_SWEATSHIRT_PRIX,
      tshirt_enabled: true,
      sweatshirt_enabled: true,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
  };
}

/**
 * Insert ou met à jour les designs (match sur le chemin image).
 * Met à jour titre / textes si l’article existe déjà sous un ancien nom.
 */
export async function ensureApparelSeedItems(
  conn: PoolConnection
): Promise<{ inserted: number; updated: number; skipped: number }> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of APPAREL_SEED_ITEMS) {
    const imagePath = item.images[0];
    const [byImage] = (await conn.execute(
      `SELECT id, titre FROM store_items
       WHERE categorie = ? AND images LIKE ?
       LIMIT 1`,
      [APPAREL_CATEGORY, `%${imagePath}%`]
    )) as [{ id: number; titre: string }[], unknown];

    const [byTitre] = byImage.length
      ? [[], null]
      : ((await conn.execute('SELECT id, titre FROM store_items WHERE titre = ? LIMIT 1', [
          item.titre,
        ])) as [{ id: number; titre: string }[], unknown]);

    const existing = byImage[0] ?? byTitre[0];
    const p = apparelSeedPayload(item);

    if (existing) {
      await conn.execute(
        `UPDATE store_items SET
          titre=?, sous_titre=?, description=?, citation=?, technique=?, dimensions=?,
          annee=?, images=?, ordre=?, style=?, extrait=?, categorie=?
         WHERE id=?`,
        [
          p.titre,
          p.sous_titre,
          p.description,
          p.citation,
          p.technique,
          p.dimensions,
          p.annee,
          JSON.stringify(p.images),
          p.ordre,
          p.style,
          p.extrait,
          APPAREL_CATEGORY,
          existing.id,
        ]
      );
      if (existing.titre !== p.titre) updated += 1;
      else skipped += 1;
      continue;
    }

    await conn.execute(
      `INSERT INTO store_items (
        titre,sous_titre,categorie,description,citation,technique,dimensions,annee,prix,
        images,disponible,paypal_link,ordre,style,extrait,in_galerie,
        promo_enabled,promo_type,promo_value,promo_start,promo_end,stock_options,apparel_options
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.titre,
        p.sous_titre,
        p.categorie,
        p.description,
        p.citation,
        p.technique,
        p.dimensions,
        p.annee,
        p.prix,
        JSON.stringify(p.images),
        1,
        p.paypal_link,
        p.ordre,
        p.style,
        p.extrait,
        0,
        0,
        null,
        null,
        null,
        null,
        null,
        JSON.stringify(p.apparel_options),
      ]
    );
    inserted += 1;
  }

  return { inserted, updated, skipped };
}
