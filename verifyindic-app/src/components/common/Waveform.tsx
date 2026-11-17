import React, { useMemo } from "react";
import { generateWaveBars } from "@/lib/formatters";

interface WaveformProps {
  count?: number;
  seed?: number;
  className?: string;
  fraction?: number; // 0 to 1 for playback highlight
}

export const Waveform: React.FC<WaveformProps> = ({
  count = 60,
  seed = 7,
  className = "",
  fraction,
}) => {
  const bars = useMemo(() => generateWaveBars(count, seed), [count, seed]);

  return (
    <div className={`wave ${className}`} aria-hidden="true">
      {bars.map((height, i) => {
        const isPast = fraction !== undefined ? i / bars.length <= fraction : false;
        return (
          <span
            key={i}
            className={isPast ? "is-past" : ""}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};

