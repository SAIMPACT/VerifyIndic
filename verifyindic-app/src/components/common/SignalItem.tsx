import React from "react";
import type { Signal } from "@/types";

interface SignalItemProps {
  signal: Signal;
}

export const SignalItem: React.FC<SignalItemProps> = ({ signal }) => {
  const pct = Math.round(signal.score * 100);

  return (
    <div className="signal">
      <div className="signal__head">
        <span className="signal__name">{signal.name}</span>
        <span className="mono muted">confidence: {signal.confidence}</span>
      </div>
      <div
        className={`bar bar--${signal.level}`}
        role="img"
        aria-label={`${signal.name} risk ${pct} percent`}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="signal__note">{signal.note}</p>
    </div>
  );
};

