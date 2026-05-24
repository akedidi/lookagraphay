'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { calcShipping, getPoidsKg } from '@/lib/shipping';

export { calcShipping, getPoidsKg };

export type CartItem = {
  id: number;
  titre: string;
  prix: number;
  /** Prix catalogue avant promo (affichage barré) */
  prix_original?: number;
  images?: string[];
  categorie: string;
  matiere?: string;
  quantite_label?: string;
  poids_kg: number;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: number, matiere?: string) => void;
  updateQty: (id: number, qty: number, matiere?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalWeight: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

function itemKey(id: number, matiere?: string) {
  return `${id}-${matiere ?? ''}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lookagraphy_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    localStorage.setItem('lookagraphy_cart', JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(newItem: Omit<CartItem, 'qty'>) {
    const key = itemKey(newItem.id, newItem.matiere);
    setItems(prev => {
      const existing = prev.find(i => itemKey(i.id, i.matiere) === key);
      if (existing) {
        return prev.map(i => itemKey(i.id, i.matiere) === key ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...newItem, qty: 1 }];
    });
    setIsOpen(true);
  }

  function removeItem(id: number, matiere?: string) {
    const key = itemKey(id, matiere);
    setItems(prev => prev.filter(i => itemKey(i.id, i.matiere) !== key));
  }

  function updateQty(id: number, qty: number, matiere?: string) {
    const key = itemKey(id, matiere);
    if (qty <= 0) {
      setItems(prev => prev.filter(i => itemKey(i.id, i.matiere) !== key));
    } else {
      setItems(prev => prev.map(i => itemKey(i.id, i.matiere) === key ? { ...i, qty } : i));
    }
  }

  function clearCart() { setItems([]); }

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.prix * i.qty, 0);
  const totalWeight = items.reduce((s, i) => s + i.poids_kg * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, hydrated, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, totalWeight, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
