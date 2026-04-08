"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Variants, Transition } from "framer-motion";

/* ─── Shared easing ───────────────────────────────────────────── */

/** Premium cubic-bezier — brisk out, smooth settle */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Slightly snappier for micro-interactions */
export const EASE_SNAPPY: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Reusable variants ───────────────────────────────────────── */

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const fadeRiseSmall: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

/* ─── Stagger helpers ─────────────────────────────────────────── */

/** Creates a stagger parent variant */
export function staggerContainer(
  staggerDelay = 0.08,
  delayChildren = 0,
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/** Creates a child variant with custom delay */
export function fadeRiseWithDelay(delay: number): Variants {
  return {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_OUT, delay },
    },
  };
}

/* ─── Hover presets ────────────────────────────────────────────── */

export const hoverLift = {
  y: -4,
  transition: { duration: 0.2, ease: EASE_SNAPPY } as Transition,
};

export const hoverLiftSmall = {
  y: -2,
  transition: { duration: 0.18, ease: EASE_SNAPPY } as Transition,
};

export const tapCompress = {
  scale: 0.97,
  transition: { duration: 0.1 } as Transition,
};

/* ─── Count-up hook ───────────────────────────────────────────── */

/**
 * Animates a numeric value from 0 to `end` when `isVisible` becomes true.
 * Uses requestAnimationFrame for smooth interpolation — no janky intervals.
 * Only runs once; ignores subsequent visibility changes.
 */
export function useCountUp(
  end: number,
  isVisible: boolean,
  durationMs = 1200,
): number {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isVisible || hasRun.current) return;
    hasRun.current = true;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic for a decelerating feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [isVisible, end, durationMs]);

  return value;
}

/* ─── Intersection observer hook ──────────────────────────────── */

/**
 * Returns [ref, isInView] — fires once when threshold is crossed.
 */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.3,
): [React.RefCallback<T>, boolean] {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      // clean up previous
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || inView) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observerRef.current?.disconnect();
          }
        },
        { threshold },
      );

      observerRef.current.observe(node);
    },
    [inView, threshold],
  );

  return [ref, inView];
}
