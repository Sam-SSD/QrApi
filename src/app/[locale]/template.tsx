"use client";

import { LazyMotion, domAnimation, m, MotionConfig } from "motion/react";

// Next.js remounts template.tsx on every navigation, so this plays an
// enter animation on each view change while header/footer stay static.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
