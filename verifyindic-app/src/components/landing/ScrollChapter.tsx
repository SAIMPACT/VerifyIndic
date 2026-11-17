import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface ScrollChapterProps {
  id: string;
  number: string;
  children: ReactNode;
}

export function ScrollChapter({ id, number, children }: ScrollChapterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="section section--white scroll-chapter" id={id}>
      <motion.div
        className="container"
        initial="waiting"
        animate="waiting"
        whileInView="revealed"
        viewport={{ margin: "0px 0px -96px 0px" }}
        variants={{
          waiting: {
            opacity: 0.25,
            y: reduceMotion ? 0 : 36,
            transition: { duration: 0 },
          },
          revealed: {
            opacity: 1,
            y: 0,
            transition: { duration: 1.15, ease: "easeOut" },
          },
        }}
      >
        <p className="eyebrow scroll-chapter__number">Chapter {number}</p>
        {children}
      </motion.div>
    </section>
  );
}
