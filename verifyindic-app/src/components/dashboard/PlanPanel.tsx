import React from "react";
import type { PlanConfig } from "@/types";

interface PlanPanelProps {
  plan: PlanConfig;
}

export const PlanPanel: React.FC<PlanPanelProps> = ({ plan }) => {
  const used = plan.used || 4020;
  const pct = Math.round((used / plan.included) * 100);

  return (
    <section className="panel">
      <span className="eyebrow">Your plan · {plan.label}</span>
      <div className="plan-row">
        <strong>
          {used.toLocaleString("en-IN")} of {plan.included.toLocaleString("en-IN")} calls used
        </strong>
        <span className="muted">Renews {plan.renews || "12 Mar 2027"}</span>
      </div>
      <div className="meter" role="img" aria-label={`${pct} percent of calls used`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="muted" style={{ margin: 0 }}>
        Included calls are covered by your plan. Calls beyond{" "}
        {plan.included.toLocaleString("en-IN")} are billed at ₹{plan.overage} each.
      </p>
    </section>
  );
};

