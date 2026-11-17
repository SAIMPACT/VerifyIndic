import React from "react";
import { appConfig } from "@/config/appConfig";
import { ScrollChapter } from "./ScrollChapter";

export const PricingSection: React.FC = () => {
  const handleScrollToAccess = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("access");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", "#access");
    }
  };

  return (
    <ScrollChapter id="pricing" number="03">
      <h2>Pricing</h2>
      <p className="section__lead">
        Each verified call costs ₹3. Track your charges in your dashboard and get one bill each month.
      </p>
      <div className="mb-4 max-w-md">
        {appConfig.pricingPlans.map((p) => {
          const title = p.title || appConfig.plans[p.key]?.label || p.key;
          return (
            <article
              key={p.key}
              className={`plan ${p.hot ? "plan--hot" : ""}`}
            >
              {p.flag && <span className="plan__flag">{p.flag}</span>}
              <h3>{title}</h3>
              <div className="plan__price">
                {p.price} <small>{p.per}</small>
              </div>
              <p className="plan__sub">{p.sub}</p>
              <ul>
                {p.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <a
                className={`btn ${p.hot ? "btn--primary" : "btn--ghost"}`}
                href={p.href}
                onClick={handleScrollToAccess}
              >
                {p.cta}
              </a>
            </article>
          );
        })}
      </div>
      <p className="muted small">
        Price excludes GST.
      </p>
    </ScrollChapter>
  );
};

