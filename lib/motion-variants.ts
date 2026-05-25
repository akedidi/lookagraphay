/** Variantes Framer Motion — contenu toujours visible au chargement (SSR + hydratation). */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: 'easeOut' as const },
  },
};

export const fadeUpStagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export const motionViewport = { once: true, amount: 0.08 as const };

/** Évite opacity:0 / translateY bloqués si whileInView ne part pas. */
export const motionFadeUp = {
  initial: 'visible' as const,
  whileInView: 'visible' as const,
  viewport: motionViewport,
  variants: fadeUp,
};
