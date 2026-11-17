import React, { useState, useEffect } from "react";
import { SignalItem } from "@/components/common/SignalItem";
import { Waveform } from "@/components/common/Waveform";
import { Pill } from "@/components/common/Pill";
import { PlanPanel } from "./PlanPanel";
import { useToast } from "@/hooks/useToast";
import { inr, dur, fmtDate, fmtTime, computeGst, downloadFile } from "@/lib/formatters";
import type { CallRecord, PlanConfig, User } from "@/types";

interface LastCallTabProps {
  calls: CallRecord[];
  selectedCallId: string;
  onSelectCall: (id: string) => void;
  onGoToBilling: () => void;
  user: User;
  plan: PlanConfig;
}

export const LastCallTab: React.FC<LastCallTabProps> = ({
  calls,
  selectedCallId,
  onSelectCall,
  onGoToBilling,
  user,
  plan,
}) => {
  const { toast } = useToast();
  const latestCall = calls[0];
  const call = calls.find((c) => c.id === selectedCallId) || latestCall;
  const isLatest = call.id === latestCall.id;
  const gstAmt = computeGst(call.charge);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); // 0 to 1

  useEffect(() => {
    // Reset player when call changes
    setIsPlaying(false);
    setPlayProgress(0);
  }, [call.id]);

  useEffect(() => {
    if (!isPlaying) return;

    const totalSeconds = Math.min(call.seconds, 10);
    const stepMs = 100;
    const interval = setInterval(() => {
      setPlayProgress((prev) => {
        const next = prev + (stepMs / 1000) / totalSeconds;
        if (next >= 1) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPlaying, call.seconds]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentSeconds = Math.floor(playProgress * call.seconds);

  const handleDownloadInvoice = () => {
    const txt = [
      "VerifyIndic — invoice (sample)",
      `Customer: ${user.company}`,
      `Call: ${call.id} (${dur(call.seconds)})`,
      `Date: ${fmtDate(call.time, true)}`,
      `Charge: ${inr(call.charge)}`,
      `GST 18%: ${inr(gstAmt)}`,
      `Total: ${inr(call.charge + gstAmt)}`,
      "",
      "Sample data, not a tax invoice.",
    ].join("\n");

    downloadFile(`invoice_${call.id}.txt`, txt);
    toast("Invoice downloaded");
  };

  const getNextStepContent = () => {
    const k = call.result.key;
    if (k === "low") {
      return {
        title: "Suggested next step: continue as normal",
        desc: "Signals look consistent with a genuine call. This is a risk signal, not a verdict.",
        cls: "next",
      };
    }
    if (k === "review") {
      return {
        title: "Suggested next step: step-up verification",
        desc: "This is a risk signal, not a verdict. Please have a person review edge cases before money moves.",
        cls: "next next--review",
      };
    }
    return {
      title: "Suggested next step: human review before money moves",
      desc: "One or more signals are elevated. This is a risk signal, not a verdict. Hold the transaction for manual review.",
      cls: "next next--high",
    };
  };

  const nextStep = getNextStepContent();

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Last call analysis</h1>
          <p>
            {isLatest ? (
              "Most recent call analysed for your account, with the charge for this call."
            ) : (
              <>
                Showing an earlier call.{" "}
                <button
                  type="button"
                  className="text-[var(--teal-dark)] underline font-medium cursor-pointer"
                  onClick={() => onSelectCall(latestCall.id)}
                >
                  Back to latest
                </button>
              </>
            )}
          </p>
        </div>
        <span className="tag">Sample data · illustrative</span>
      </div>

      <div className="layout">
        <div>
          <section className="panel">
            <span className="eyebrow">Call details</span>
            <div className="tiles">
              <div className="tile">
                <span className="mono">Call ID</span>
                <strong>{call.id}</strong>
              </div>
              <div className="tile">
                <span className="mono">Date &amp; time</span>
                <strong>
                  {fmtDate(call.time, true)}, {fmtTime(call.time)}
                </strong>
              </div>
              <div className="tile">
                <span className="mono">Duration</span>
                <strong>{dur(call.seconds)}</strong>
              </div>
              <div className="tile">
                <span className="mono">Language</span>
                <strong>{call.language}</strong>
              </div>
            </div>

            <div className="player">
              <div className="player__top">
                <button
                  className="player__play"
                  id="play"
                  type="button"
                  aria-label="Play sample animation"
                  onClick={togglePlay}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
                <span>{call.file}</span>
                <span id="playT" className="mono">
                  {dur(currentSeconds)} / {dur(call.seconds)}
                </span>
              </div>
              <Waveform
                count={70}
                seed={call.seconds + 2}
                fraction={isPlaying || playProgress > 0 ? playProgress : undefined}
              />
            </div>

            <span className="eyebrow">Risk signals</span>
            <div style={{ marginTop: 14 }}>
              {call.signals.map((sig) => (
                <SignalItem key={sig.id} signal={sig} />
              ))}
            </div>

            <div className={nextStep.cls}>
              <strong>{nextStep.title}</strong>
              <p>{nextStep.desc}</p>
            </div>
          </section>
        </div>

        <aside>
          <section className="panel">
            <span className="eyebrow">Billed for this call</span>
            <div className="amount">{inr(call.charge)}</div>
            <p className="muted" style={{ margin: 0 }}>
              1 call analysed · {plan.label} plan overage rate
            </p>
            <ul className="lines">
              <li>
                <span>
                  Call {call.id} ({dur(call.seconds)})
                </span>
                <span className="mono">{inr(call.charge)}</span>
              </li>
              <li>
                <span>GST (18%)</span>
                <span className="mono">{inr(gstAmt)}</span>
              </li>
              <li className="total">
                <span>Total for this call</span>
                <span className="mono">{inr(call.charge + gstAmt)}</span>
              </li>
            </ul>
            <div className="btn-row">
              <button
                className="btn btn--primary"
                id="dlInv"
                type="button"
                onClick={handleDownloadInvoice}
              >
                Download invoice
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={onGoToBilling}
              >
                View billing
              </button>
            </div>
          </section>

          <PlanPanel plan={plan} />
        </aside>
      </div>

      <section className="panel">
        <span className="eyebrow">Recent calls</span>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Call ID</th>
                <th>When</th>
                <th>Language</th>
                <th>Result</th>
                <th>Charge</th>
              </tr>
            </thead>
            <tbody>
              {calls.slice(0, 3).map((c, i) => (
                <tr
                  key={c.id}
                  data-id={c.id}
                  className={c.id === call.id ? "is-sel" : ""}
                  tabIndex={0}
                  aria-label={`Show analysis for ${c.id}`}
                  onClick={() => {
                    onSelectCall(c.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectCall(c.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  <td className="mono">
                    {c.id} {i === 0 ? "(latest)" : ""}
                  </td>
                  <td>
                    {fmtDate(c.time)}, {fmtTime(c.time)}
                  </td>
                  <td>{c.language}</td>
                  <td>
                    <Pill tone={c.result.key === "low" ? "ok" : c.result.key === "review" ? "warn" : "high"}>
                      {c.result.label}
                    </Pill>
                  </td>
                  <td className="mono">{inr(c.charge)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Sample rows. Charges shown before GST. Results are risk signals, never a final verdict. Select a row to view that call.
        </p>
      </section>
    </div>
  );
};

