import React, { useRef } from "react";
import { useToast } from "@/hooks/useToast";
import { ScrollChapter } from "./ScrollChapter";

export const HowItWorksSection: React.FC = () => {
  const { toast } = useToast();
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    const rawText = `# request
POST /v1/analyze
{ "media": "voice_clip.wav", "language": "hi" }

# response
{
  "signals": [
    { "name": "voice_naturalness", "score": 0.22, "confidence": "medium", "reason": "low concern" },
    { "name": "channel_codec",     "score": 0.48, "confidence": "medium", "reason": "review" }
  ],
  "recommendation": "human_review_for_edge_cases"
}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(rawText).then(
        () => toast("Example copied"),
        () => toast("Example copied")
      );
    } else {
      toast("Example copied");
    }
  };

  return (
    <ScrollChapter id="how" number="01">
      <h2>How it works</h2>
      <p className="section__lead">
        Three steps. We return risk signals, your application makes the call.
      </p>

      <div className="grid3">
        <div className="step">
          <span className="mono step__n">1 · SEND</span>
          <h3>Voice clip or document image</h3>
          <p>POST the file to one endpoint.</p>
        </div>
        <div className="step">
          <span className="mono step__n">2 · RECEIVE</span>
          <h3>Signals and reasons</h3>
          <p>Signal bars, confidence and plain-language reason codes.</p>
        </div>
        <div className="step">
          <span className="mono step__n">3 · DECIDE</span>
          <h3>Your app acts</h3>
          <p>Approve, step up verification, or send to human review.</p>
        </div>
      </div>

      <div className="code-wrap">
        <div className="code-wrap__bar">
          <span className="mono">EXAMPLE · not a live endpoint or key</span>
          <button
            className="btn btn--sm btn--dark-ghost"
            id="copyCode"
            type="button"
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
        <pre className="code" id="codeSample" ref={codeRef}>
          <span className="c"># request</span>{"\n"}
          <span className="k">POST</span> /v1/analyze{"\n"}
          {"{ "}<span className="s">"media"</span>: <span className="s">"voice_clip.wav"</span>, <span className="s">"language"</span>: <span className="s">"hi"</span>{" }"}{"\n\n"}
          <span className="c"># response</span>{"\n"}
          {"{\n"}
          {"  "}<span className="s">"signals"</span>: [{"\n"}
          {"    "}{"{ "}<span className="s">"name"</span>: <span className="s">"voice_naturalness"</span>, <span className="s">"score"</span>: <span className="n">0.22</span>, <span className="s">"confidence"</span>: <span className="s">"medium"</span>, <span className="s">"reason"</span>: <span className="s">"low concern"</span>{" },\n"}
          {"    "}{"{ "}<span className="s">"name"</span>: <span className="s">"channel_codec"</span>,     <span className="s">"score"</span>: <span className="n">0.48</span>, <span className="s">"confidence"</span>: <span className="s">"medium"</span>, <span className="s">"reason"</span>: <span className="s">"review"</span>{" }\n"}
          {"  ],\n"}
          {"  "}<span className="s">"recommendation"</span>: <span className="s">"human_review_for_edge_cases"</span>{"\n"}
          {"}"}
        </pre>
      </div>
    </ScrollChapter>
  );
};

