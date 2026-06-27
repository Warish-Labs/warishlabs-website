// Constants for Framer Motion animation configurations

export const SPRING_DEFAULT = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
} as const;

export const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
} as const;

export const SPRING_BOUNCY = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
} as const;

export const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94];
export const EASE_ENTRANCE = [0.0, 0.0, 0.2, 1.0];
export const EASE_EXIT = [0.4, 0.0, 1.0, 1.0];

export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export const DURATION = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6,
};
