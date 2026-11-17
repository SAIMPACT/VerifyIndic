import React, { useState, useMemo } from "react";
import { Pill } from "@/components/common/Pill";
import { useToast } from "@/hooks/useToast";
import { inr, dur, fmtDate, fmtTime, downloadFile } from "@/lib/formatters";
import type { CallRecord } from "@/types";

interface CallHistoryTabProps {
  calls: CallRecord[];
  onSelectCallAndGoToLast: (id: string) => void;
}

export const CallHistoryTab: React.FC<CallHistoryTabProps> = ({
  calls,
  onSelectCallAndGoToLast,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [sortBy, setSortBy] = useState("new");

  const filteredAndSortedCalls = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = calls.filter((c) => {
      const matchesSearch = !term || c.id.toLowerCase().includes(term);
      const matchesResult = !resultFilter || c.result.key === resultFilter;
      return matchesSearch && matchesResult;
    });

    const maxScore = (c: CallRecord) =>
      Math.max(...c.signals.map((s) => s.score));

    return filtered.sort((a, b) => {
      if (sortBy === "old") {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      }
      if (sortBy === "risk") {
        return maxScore(b) - maxScore(a);
      }
      // default: new
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [calls, searchTerm, resultFilter, sortBy]);

  const handleExportCsv = () => {
    const header = "call_id,time,duration_s,result,charge_inr";
    const rows = filteredAndSortedCalls.map((c) =>
      [c.id, c.time, c.seconds, c.result.label, c.charge].join(",")
    );
    const csvContent = [header, ...rows].join("\n");
    downloadFile("verifyindic_calls.csv", csvContent, "text/csv");
    toast("CSV exported");
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Call history</h1>
          <p>Every call analysed for your account. Filter, search and export.</p>
        </div>
        <span className="tag">Sample data · illustrative</span>
      </div>

      <section className="panel">
        <div className="filters">
          <div className="field">
            <label htmlFor="q">Search by call ID</label>
            <input
              id="q"
              type="search"
              placeholder="e.g. 8F2A"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="fr">Result</label>
            <select
              id="fr"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
            >
              <option value="">All results</option>
              <option value="low">Low concern</option>
              <option value="review">Review</option>
              <option value="high">Elevated risk</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="fs">Sort</label>
            <select
              id="fs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
              <option value="risk">Highest risk first</option>
            </select>
          </div>
        </div>

        <div
          className="btn-row"
          style={{
            margin: "0 0 12px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="muted" id="count" aria-live="polite">
            {filteredAndSortedCalls.length}{" "}
            {filteredAndSortedCalls.length === 1 ? "call" : "calls"}
          </span>
          <button
            className="btn btn--ghost btn--sm"
            id="csv"
            type="button"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Call ID</th>
                <th>When</th>
                <th>Duration</th>
                <th>Result</th>
                <th>Charge</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCalls.length > 0 ? (
                filteredAndSortedCalls.map((c) => (
                  <tr
                    key={c.id}
                    data-id={c.id}
                    tabIndex={0}
                    onClick={() => onSelectCallAndGoToLast(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectCallAndGoToLast(c.id);
                      }
                    }}
                  >
                    <td className="mono">{c.id}</td>
                    <td>
                      {fmtDate(c.time)}, {fmtTime(c.time)}
                    </td>
                    <td>{dur(c.seconds)}</td>
                    <td>
                      <Pill
                        tone={
                          c.result.key === "low"
                            ? "ok"
                            : c.result.key === "review"
                            ? "warn"
                            : "high"
                        }
                      >
                        {c.result.label}
                      </Pill>
                    </td>
                    <td className="mono">{inr(c.charge)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty">
                    No calls match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="table-note">
          Charges shown before GST. Results are risk signals, never a final verdict.
        </p>
      </section>
    </div>
  );
};

