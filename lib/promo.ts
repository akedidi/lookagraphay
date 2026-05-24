export type PromoType = 'percent' | 'amount';

export type PromoInput = {
  prix: number;
  promo_enabled?: boolean;
  promo_type?: PromoType | string | null;
  promo_value?: number | null;
  promo_start?: string | Date | null;
  promo_end?: string | Date | null;
};

export type PromoResult = {
  active: boolean;
  original: number;
  final: number;
};

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Promo active si activée manuellement + type/valeur valides + dans la fenêtre de dates. */
export function isPromoActive(input: PromoInput, now: Date = new Date()): boolean {
  if (!input.promo_enabled) return false;
  if (input.promo_type !== 'percent' && input.promo_type !== 'amount') return false;
  const value = Number(input.promo_value);
  if (!Number.isFinite(value) || value <= 0) return false;
  if (input.promo_type === 'percent' && value > 100) return false;

  const start = parseDate(input.promo_start);
  const end = parseDate(input.promo_end);
  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
}

export function computePromoPrice(basePrice: number, input: PromoInput, now?: Date): PromoResult {
  const original = Math.max(0, Number(basePrice) || 0);
  if (!isPromoActive(input, now)) {
    return { active: false, original, final: original };
  }

  const value = Number(input.promo_value);
  let final = original;
  if (input.promo_type === 'percent') {
    final = original * (1 - value / 100);
  } else if (input.promo_type === 'amount') {
    final = original - value;
  }

  final = Math.max(0, Math.round(final * 100) / 100);
  if (final >= original) {
    return { active: false, original, final: original };
  }

  return { active: true, original, final };
}

export function formatPromoLabel(input: PromoInput, now?: Date): string | null {
  if (!isPromoActive(input, now)) return null;
  if (input.promo_type === 'percent') return `-${input.promo_value}%`;
  if (input.promo_type === 'amount') return `-${Number(input.promo_value).toFixed(2)} €`;
  return null;
}
