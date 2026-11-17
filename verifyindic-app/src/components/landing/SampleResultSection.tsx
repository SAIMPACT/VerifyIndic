import React from "react";
import { SignalItem } from "@/components/common/SignalItem";
import { Waveform } from "@/components/common/Waveform";
import { sampleCalls } from "@/data/mockData";

export const SampleResultSection: React.FC = () => {
  const sampleSignals = sampleCalls[0].signals;

  return (
    <section className="section">
      <div className="container">
        <h2>See a sample result</h2>
        <p className="section__lead">
          This is a fixed example, not a live model. A real upload demo will appear once a model sits behind it.
        </p>
        <div className="sample-grid">
          <div className="wavebox">
            <span className="tag">Sample output</span>
            <p className="mono wavebox__file">sample_clip_hindi.wav · 0:08</p>
            <Waveform count={48} seed={9} />
          </div>
          <div className="card">
            <p className="eyebrow">Signals · hard-coded example</p>
            <div>
              {sampleSignals.map((sig) => (
                <SignalItem key={sig.id} signal={sig} />
              ))}
            </div>
            <p className="muted small">
              One risk signal, not a verdict. Please review edge cases manually.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

