export const POIDS_KG: Record<string, number> = {
  Tableau: 2.5,
  Bague: 0.15,
  Pendentif: 0.1,
  "Boucles d'oreilles": 0.2,
};

export function getPoidsKg(categorie: string): number {
  return POIDS_KG[categorie] ?? 0.5;
}

export function calcShipping(
  totalWeight: number,
  deliveryType: 'relay' | 'home' | 'international',
  pays: string
): number | null {
  const freeRelayCountries = ['FR', 'BE', 'LU', 'ES', 'PT', 'DE'];
  if (deliveryType === 'relay') {
    if (freeRelayCountries.includes(pays)) return 0;
    return null;
  }
  if (deliveryType === 'home' && pays === 'FR') {
    if (totalWeight <= 1) return 10;
    if (totalWeight <= 5) return 15;
    if (totalWeight <= 10) return 25;
    if (totalWeight <= 30) return 40;
    return null;
  }
  return null;
}
