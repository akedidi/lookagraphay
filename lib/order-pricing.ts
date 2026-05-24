import type { PoolConnection } from 'mysql2/promise';
import {
  calcBijouBasePrice,
  isBijouCategory,
  parseMatiere,
  parseQuantite,
} from '@/lib/bijou-pricing';
import { calcShipping, getPoidsKg } from '@/lib/shipping';
import { mapStoreItemFromRow, resolvePriceForBase, type MappedStoreItem } from '@/lib/store-item';
import type { PromoInput } from '@/lib/promo';

export type OrderLineInput = {
  id: number;
  qty: number;
  titre?: string;
  categorie?: string;
  matiere?: string;
  quantite_label?: string;
  prix?: number;
};

export type ValidatedOrderLine = {
  id: number;
  titre: string;
  prix: number;
  prix_original?: number;
  qty: number;
  categorie: string;
  matiere?: string;
  quantite_label?: string;
  poids_kg: number;
};

function promoInputFromItem(item: MappedStoreItem): PromoInput {
  return {
    prix: item.prix,
    promo_enabled: item.promo_enabled,
    promo_type: item.promo_type,
    promo_value: item.promo_value,
    promo_start: item.promo_start,
    promo_end: item.promo_end,
  };
}

function unitPriceForLine(item: MappedStoreItem, line: OrderLineInput): { unitPrice: number; original?: number } {
  if (isBijouCategory(item.categorie)) {
    const base = calcBijouBasePrice(
      item.categorie,
      parseMatiere(line.matiere),
      parseQuantite(line.quantite_label)
    );
    const promo = resolvePriceForBase(promoInputFromItem(item), base);
    return {
      unitPrice: promo.final,
      original: promo.active ? promo.original : undefined,
    };
  }

  return {
    unitPrice: item.prix_promo,
    original: item.promo_active ? item.prix : undefined,
  };
}

export async function validateOrderPricing(
  conn: PoolConnection,
  input: {
    items: OrderLineInput[];
    delivery_type: string;
    pays?: string;
  }
): Promise<{
  items: ValidatedOrderLine[];
  shippingCost: number;
  subtotal: number;
  total: number;
  totalWeight: number;
}> {
  const { items, delivery_type, pays = 'FR' } = input;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Panier vide');
  }
  if (delivery_type === 'international') {
    throw new Error('Commande internationale : contactez-nous pour un devis');
  }
  if (delivery_type !== 'relay' && delivery_type !== 'home') {
    throw new Error('Mode de livraison invalide');
  }

  const ids = Array.from(new Set(items.map((i) => Number(i.id)).filter((id) => id > 0)));
  if (ids.length === 0) {
    throw new Error('Articles invalides');
  }

  const placeholders = ids.map(() => '?').join(',');
  const [rows] = (await conn.execute(
    `SELECT * FROM store_items WHERE id IN (${placeholders})`,
    ids
  )) as [Record<string, unknown>[], unknown];

  const byId = new Map(rows.map((row) => [Number(row.id), mapStoreItemFromRow(row)]));

  const validated: ValidatedOrderLine[] = [];
  let subtotal = 0;
  let totalWeight = 0;

  for (const line of items) {
    const id = Number(line.id);
    const item = byId.get(id);
    if (!item) {
      throw new Error(`Article introuvable (réf. ${id})`);
    }
    if (!item.disponible) {
      throw new Error(`« ${item.titre} » n'est plus disponible`);
    }

    const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
    const { unitPrice, original } = unitPriceForLine(item, line);
    const poids_kg = getPoidsKg(item.categorie);

    validated.push({
      id: item.id,
      titre: item.titre,
      prix: unitPrice,
      prix_original: original,
      qty,
      categorie: item.categorie,
      matiere: line.matiere || undefined,
      quantite_label: line.quantite_label || undefined,
      poids_kg,
    });

    subtotal += unitPrice * qty;
    totalWeight += poids_kg * qty;
  }

  const shippingCost = calcShipping(totalWeight, delivery_type, pays);
  if (shippingCost === null) {
    throw new Error('Livraison non disponible pour cette destination');
  }

  const subtotalRounded = Math.round(subtotal * 100) / 100;
  const total = Math.round((subtotalRounded + shippingCost) * 100) / 100;

  return {
    items: validated,
    shippingCost,
    subtotal: subtotalRounded,
    total,
    totalWeight,
  };
}
