import type { PoolConnection } from 'mysql2/promise';
import {
  APPAREL_CATEGORY,
  DEFAULT_SWEATSHIRT_PRIX,
  DEFAULT_TSHIRT_PRIX,
} from '@/lib/store-categories';

/** Collection vêtements (1 visuel = 1 article, options T-shirt / Sweat-shirt). */
export const APPAREL_SEED_ITEMS = [
  {
    titre: 'Rasma Ḥayāt — رسمة حياة',
    sous_titre: 'Dessin de vie',
    description:
      'Calligraphie blanche sur fond noir : « Dessin de vie ». Un même visuel proposé en T-shirt ou Sweat-shirt, tailles S à XXL.',
    citation: 'رسمة حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/rasma-hayat.jpg'],
    ordre: 100,
  },
  {
    titre: 'Khadīja — خديجة',
    sous_titre: 'Calligraphie d’un prénom',
    description:
      'Prénom calligraphié en blanc sur tee noir. Disponible en T-shirt ou Sweat-shirt, toutes tailles au même prix selon le modèle.',
    citation: 'خديجة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/khadija.jpg'],
    ordre: 101,
  },
  {
    titre: 'Al-Mūsīqā Ḥayāt — الموسيقى حياة',
    sous_titre: 'La musique est vie',
    description:
      'Calligraphie « La musique est vie », avec une clé de sol intégrée au trait. Même design en T-shirt (50 €) ou Sweat-shirt (65 €).',
    citation: 'الموسيقى حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/musiqa-hayat.jpg'],
    ordre: 102,
  },
  {
    titre: 'Al-Sīnimā Ḥayāt — السينما حياة',
    sous_titre: 'Le cinéma est vie',
    description:
      '« Le cinéma est vie » en calligraphie contemporaine blanche sur noir. Options T-shirt / Sweat-shirt, tailles S–XXL.',
    citation: 'السينما حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/cinema-hayat.jpg'],
    ordre: 103,
  },
  {
    titre: 'Al-Fann Ḥayāt — فن حياة',
    sous_titre: 'L’art est vie',
    description:
      'Calligraphie « L’art est vie » sur tee noir. Un visuel, deux modèles (T-shirt ou Sweat-shirt), prix selon le modèle choisi.',
    citation: 'فن حياة',
    technique: 'Sérigraphie calligraphique',
    dimensions: 'Coupe unisexe',
    annee: '2025',
    images: ['/images/articles/vetements/fann-hayat.jpg'],
    ordre: 104,
  },
  {
    titre: 'Al-Masraḥ Ḥayāt — المسرح حياة',
    sous_titre: 'Le théâtre est vie',
    description:
      '« Le théâtre est vie » calligraphié en blanc. Disponible en T-shirt et Sweat-shirt ; les tailles ne changent pas le prix.',
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

/** Insert les designs manquants (idempotent). */
export async function ensureApparelSeedItems(
  conn: PoolConnection
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const item of APPAREL_SEED_ITEMS) {
    const [existing] = (await conn.execute(
      'SELECT id FROM store_items WHERE titre = ? LIMIT 1',
      [item.titre]
    )) as [{ id: number }[], unknown];

    if (existing.length > 0) {
      skipped += 1;
      continue;
    }

    const p = apparelSeedPayload(item);
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

  return { inserted, skipped };
}
