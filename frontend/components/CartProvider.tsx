'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/lib/products';

/**
 * SCULPT'AURA — cart context.
 *
 * A minimal, dependency-free cart held in React state and mirrored to
 * localStorage so it survives reloads. Each line snapshots the fields the UI
 * needs (name, price, image, slug) so the cart renders without re-fetching the
 * catalogue. All monetary values are integers in the native currency, XAF.
 */

export type CartLine = {
  productId: string;
  slug: string;
  name: Record<'fr' | 'en', string>;
  image: string;
  unitPriceXAF: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  /** Total number of units across all lines (used for the header badge). */
  count: number;
  /** Sum of unit price × quantity, in XAF. */
  subtotalXAF: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CART_STORAGE_KEY = 'sculptaura.cart';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore the persisted cart on mount (client only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      // Corrupt / unavailable storage — start with an empty cart.
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist on every change, but only after the initial hydration so we never
  // overwrite a stored cart with the empty initial state.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore persistence failures — in-memory state remains authoritative.
    }
  }, [lines, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id
            ? { ...l, quantity: l.quantity + quantity }
            : l,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          unitPriceXAF: product.priceXAF,
          quantity,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.productId === productId
            ? { ...l, quantity: Math.max(0, Math.trunc(quantity)) }
            : l,
        )
        // Dropping to zero removes the line entirely.
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { count, subtotalXAF } = useMemo(() => {
    return lines.reduce(
      (acc, l) => ({
        count: acc.count + l.quantity,
        subtotalXAF: acc.subtotalXAF + l.unitPriceXAF * l.quantity,
      }),
      { count: 0, subtotalXAF: 0 },
    );
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      subtotalXAF,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [
      lines,
      count,
      subtotalXAF,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access the cart state and mutators. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a <CartProvider>.');
  }
  return ctx;
}
