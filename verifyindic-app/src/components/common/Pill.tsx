import React from "react";
import type { Tone } from "@/types";

interface PillProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

export const Pill: React.FC<PillProps> = ({ tone = "plain", children, className = "" }) => {
  return (
    <span className={`pill pill--${tone} ${className}`}>
      {children}
    </span>
  );
};

