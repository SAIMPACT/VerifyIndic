import React from "react";

export const DocsTab: React.FC = () => {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Docs</h1>
          <p>
            Quick reference for the analyse endpoint. Full docs will live here once they exist.
          </p>
        </div>
      </div>

      <div className="docs-grid">
        <section className="panel">
          <span className="eyebrow">Quickstart</span>
          <pre className="code">
            <span className="c"># request</span>{"\n"}
            <span className="k">POST</span> /v1/analyze{"\n"}
            {"{ "}<span className="s">"media"</span>: <span className="s">"voice_clip.wav"</span>, <span className="s">"language"</span>: <span className="s">"hi"</span>{" }"}{"\n\n"}
            <span className="c"># response</span>{"\n"}
            {"{\n"}
            {"  "}<span className="s">"signals"</span>: [ {"{ "}<span className="s">"name"</span>: <span className="s">"voice_naturalness"</span>, <span className="s">"score"</span>: <span className="n">0.22</span>{" }" } ],{"\n"}
            {"  "}<span className="s">"recommendation"</span>: <span className="s">"human_review_for_edge_cases"</span>{"\n"}
            {"}"}
          </pre>
          <p className="table-note">Example only. Not a live endpoint or key.</p>
        </section>

        <section className="panel">
          <span className="eyebrow">Signals</span>
          <div className="def">
            <code>voice_naturalness</code>
            <span className="muted">
              Whether prosody, breathing and timing look like a live human voice.
            </span>
          </div>
          <div className="def">
            <code>channel_codec</code>
            <span className="muted">
              Whether compression and noise look like a real phone line.
            </span>
          </div>
          <div className="def">
            <code>replay_liveness</code>
            <span className="muted">
              Whether cues suggest a recording played back into the call.
            </span>
          </div>
          <div className="def">
            <code>score</code>
            <span className="muted">
              0 to 1. Higher means more concern. Under 0.35 low, 0.35–0.7 review, above 0.7 elevated.
            </span>
          </div>
          <div className="def">
            <code>confidence</code>
            <span className="muted">
              low, medium or high. How sure the model is about that score.
            </span>
          </div>
          <p className="table-note">
            A score is a risk signal, not proof of identity. Use step-up verification before money moves.
          </p>
        </section>
      </div>
    </div>
  );
};

