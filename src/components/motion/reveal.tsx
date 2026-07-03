"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode, ElementType } from "react";
import { EASE_OUT } from "@/components/motion/easing";

type Direction = "up" | "down" | "left" | "right" | "none";

const offset = (dir: Direction, d: number) => {
  switch (dir) {
    case "up":
      return { y: d };
    case "down":
      return { y: -d };
    case "left":
      return { x: d };
    case "right":
      return { x: -d };
    default:
      return {};
  }
};

interface RevealProps {
  children: ReactNode;
  /** Slide-in direction. */
  direction?: Direction;
  /** Travel distance in px. */
  distance?: number;
  /** Delay before animation starts (seconds). */
  delay?: number;
  /** Animation duration (seconds). */
  duration?: number;
  /** Stagger index — same as delay but semantic. */
  index?: number;
  /** Render as a different element. */
  as?: "div" | "section" | "li" | "span" | "p" | "h2" | "h3";
  className?: string;
  /** Trigger once (default) or every time it enters the viewport. */
  once?: boolean;
}

/**
 * Scroll-triggered reveal wrapper. Fades + slides children into view using
 * `motion`. Respects `prefers-reduced-motion` (renders children statically).
 */
export function Reveal({
  children,
  direction = "up",
  distance = 24,
  delay = 0,
  duration = 0.6,
  index,
  as = "div",
  className,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as ElementType;

  const resolvedDelay = index ? index * 0.08 + delay : delay;

  if (reduce) {
    const Tag = as as keyof React.JSX.IntrinsicElements;
    return <Tag className={className}>{children}</Tag>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, ...offset(direction, distance), filter: "blur(6px)" },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        delay: resolvedDelay,
        ease: EASE_OUT,
      },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}
