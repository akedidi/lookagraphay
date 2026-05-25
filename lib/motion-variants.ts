/** Animations visibles même si whileInView ne se déclenche pas (hydratation / headless / CDN). */
export const fadeUp = {
  hidden: { opacity: 1, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: 'easeOut' as const },
  },
};

export const fadeUpStagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export const motionViewport = { once: true, amount: 0.12 as const };
