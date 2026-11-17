import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const defaultWords = ["better", "modern", "beautiful", "awesome"];
const badge = "col-start-1 row-start-1 whitespace-nowrap rounded-lg px-[0.35em] py-[0.14em]";

export interface ContainerTextFlipProps {
  words?: readonly string[];
  interval?: number;
  className?: string;
  textClassName?: string;
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = defaultWords,
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const word = words[index % words.length];

  useEffect(() => {
    if (words.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, words.length]);

  if (word === undefined) return null;

  return (
    <span className={cn("inline-grid align-baseline", className)}>
      {words.map((value, position) => (
        <span key={position} aria-hidden="true" className={cn(badge, "invisible", textClassName)}>
          {value}
        </span>
      ))}
      <motion.span
        layout={reduceMotion ? false : "size"}
        transition={{ layout: { duration: animationDuration / 2000 } }}
        className={cn(
          badge,
          "inline-flex items-center justify-center bg-slate-100 text-slate-900",
          reduceMotion ? "justify-self-stretch" : "justify-self-start",
          textClassName,
        )}
      >
        <motion.span
          key={word}
          initial={reduceMotion ? { opacity: 0.45 } : { opacity: 0, filter: "blur(6px)" }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: reduceMotion ? 0.25 : animationDuration / 1000 }}
        >
          {word}
        </motion.span>
      </motion.span>
    </span>
  );
}
