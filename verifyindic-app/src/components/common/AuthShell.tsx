import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/common/Brand";
import "./auth-shell.css";

const waveform = [18, 34, 25, 46, 64, 41, 27, 48, 78, 54, 32, 60, 90, 72, 40, 24, 48, 64, 45, 30, 55, 74, 42, 25, 36, 16];

export function AuthShell({ title, intro, children }: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-shell__entry" aria-labelledby="auth-title">
        <header className="auth-shell__header"><Brand /></header>
        <div className="auth-shell__content">
          <h1 id="auth-title">{title}</h1>
          <div className="auth-shell__intro">{intro}</div>
          {children}
          <Link className="auth-shell__back" to="/">← Back to home</Link>
        </div>
      </section>
      <aside className="auth-shell__product">
        <div className="auth-shell__product-content">
          <div className="auth-preview" aria-hidden="true">
            <div className="auth-preview__header">
              <span>Voice verification</span><small>Sample result</small>
            </div>
            <div className="auth-preview__wave">
              {waveform.map((height, index) => <span key={index} style={{ height: height + "%" }} />)}
            </div>
            <div className="auth-preview__footer">
              <div><strong>Inbound call</strong><small>Hindi · 00:24</small></div>
              <span className="auth-preview__result">✓ Human voice</span>
            </div>
          </div>
          <h2>Know who’s on the other end.</h2>
          <p>Review voice verification results and call history for your workspace.</p>
        </div>
      </aside>
    </main>
  );
}
