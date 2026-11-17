import React from "react";
import { Link } from "react-router-dom";
import { PlanPanel } from "./PlanPanel";
import { useToast } from "@/hooks/useToast";
import { inr, fmtDate, computeGst, downloadFile } from "@/lib/formatters";
import type { CallRecord, Invoice, PlanConfig, User } from "@/types";

interface BillingTabProps {
  calls: CallRecord[];
  invoices: Invoice[];
  user: User;
  plan: PlanConfig;
}

export const BillingTab: React.FC<BillingTabProps> = ({
  calls,
  invoices,
  user,
  plan,
}) => {
  const { toast } = useToast();
  const recentCalls = calls.slice(0, 3);
  const subtotal = recentCalls.reduce((s, c) => s + c.charge, 0);
  const gstAmt = computeGst(subtotal);
  const totalAmount = subtotal + gstAmt;

  const handleDownloadInvoice = (inv: Invoice) => {
    const invGst = computeGst(inv.amount);
    const lines = [
      `VerifyIndic — ${inv.label}`,
      `Customer: ${user.company}`,
      `Amount: ${inr(inv.amount)}`,
      `GST 18%: ${inr(invGst)}`,
      `Total: ${inr(inv.amount + invGst)}`,
      "",
      "Sample data, not a tax invoice.",
    ].join("\n");

    downloadFile(`${inv.id}.txt`, lines);
    toast("Invoice downloaded");
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Billing</h1>
          <p>Your plan, usage and invoices.</p>
        </div>
        <span className="tag">Sample data · illustrative</span>
      </div>

      <div className="layout">
        <div>
          <section className="panel">
            <span className="eyebrow">This month so far</span>
            <div className="amount">{inr(totalAmount)}</div>
            <p className="muted" style={{ margin: 0 }}>
              {recentCalls.length} calls at ₹{plan.overage} each, plus 18% GST.
            </p>
            <ul className="lines">
              {recentCalls.map((c) => (
                <li key={c.id}>
                  <span>
                    {c.id} · {fmtDate(c.time)}
                  </span>
                  <span className="mono">{inr(c.charge)}</span>
                </li>
              ))}
              <li>
                <span>GST (18%)</span>
                <span className="mono">{inr(gstAmt)}</span>
              </li>
              <li className="total">
                <span>Total</span>
                <span className="mono">{inr(totalAmount)}</span>
              </li>
            </ul>
          </section>

          <section className="panel">
            <span className="eyebrow">Invoices</span>
            {invoices.map((inv) => (
              <div key={inv.id} className="key-row">
                <div>
                  <strong>{inv.label}</strong>
                  <div className="mono muted" style={{ fontSize: "0.8rem" }}>
                    {inv.id} · {inr(inv.amount)} before GST
                  </div>
                </div>
                <button
                  className="btn btn--ghost btn--sm"
                  type="button"
                  onClick={() => handleDownloadInvoice(inv)}
                >
                  Download
                </button>
              </div>
            ))}
          </section>
        </div>

        <aside>
          <PlanPanel plan={plan} />

          <section className="panel">
            <span className="eyebrow">Change plan</span>
            <p className="muted">
              Need more calls or more seats? Plans are examples for now.
            </p>
            <Link className="btn btn--ghost inline-block" to="/#pricing">
              See plans
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};

