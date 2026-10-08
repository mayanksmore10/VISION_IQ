// src/lib/motion.ts
// Shared Framer Motion presets — reuse across all pages/components

import type { Variants, Transition } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Transitions                                                         */
/* ------------------------------------------------------------------ */

export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 30,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

export const easeOut200: Transition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };
export const easeOut300: Transition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };
export const easeOut500: Transition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] };

/* ------------------------------------------------------------------ */
/*  Page transition (AnimatePresence wrapper)                           */
/* ------------------------------------------------------------------ */

export const page: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeOut300 },
  exit:    { opacity: 0, y: -8, transition: easeOut200 },
};

/* ------------------------------------------------------------------ */
/*  Fade up — for scroll-reveal sections                               */
/* ------------------------------------------------------------------ */

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeOut500 },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: easeOut300 },
};

/* ------------------------------------------------------------------ */
/*  Stagger container — wraps a list to stagger children               */
/* ------------------------------------------------------------------ */

export const stagger = (staggerChildren = 0.07, delayChildren = 0): Variants => ({
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOut300 },
};

/* ------------------------------------------------------------------ */
/*  Slide in from right (drawers, panels)                              */
/* ------------------------------------------------------------------ */

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: springSmooth },
  exit:    { opacity: 0, x: 32, transition: easeOut200 },
};

/* ------------------------------------------------------------------ */
/*  Spring pop — cards, clarification panel                            */
/* ------------------------------------------------------------------ */

export const springPop: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: springSmooth },
  exit:    { opacity: 0, scale: 0.94, transition: easeOut200 },
};

/* ------------------------------------------------------------------ */
/*  Sidebar item highlight slide                                        */
/* ------------------------------------------------------------------ */

export const sidebarIndicator: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
};

/* ------------------------------------------------------------------ */
/*  Toast / notification slide in from top                             */
/* ------------------------------------------------------------------ */

export const toastSlide: Variants = {
  hidden:  { opacity: 0, y: -20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springSmooth },
  exit:    { opacity: 0, y: -16, scale: 0.96, transition: easeOut200 },
};
