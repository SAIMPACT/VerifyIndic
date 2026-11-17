import React from "react";

export const TrustSection: React.FC = () => {
  return (
    <section className="section">
      <div className="container">
        <h2>Trust and privacy</h2>
        <p className="section__lead">
          Written in plain language, published only once decided.
        </p>
        <ul className="trust">
          <li>
            What we store and for how long: <code className="mono">to be decided</code>
          </li>
          <li>
            What we never store: <code className="mono">to be decided</code>
          </li>
          <li>
            Our output is a risk signal, not proof of identity. We recommend step-up verification before money moves.
          </li>
          <li>
            Detection accuracy drops on new generators, noise, compression and unseen languages. We say so up front.
          </li>
        </ul>
      </div>
    </section>
  );
};

