import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { SignalItem } from "@/components/common/SignalItem";
import { Waveform } from "@/components/common/Waveform";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { sampleCalls } from "@/data/mockData";

const fraudTypes = ["voice clones", "replayed calls", "fake IDs"];

const BackgroundCubesGrid = lazy(() =>
  import("@/components/ui/background-cubes-grid").then(({ BackgroundCubesGrid }) => ({
    default: BackgroundCubesGrid,
  })),
);

export const HeroSection: React.FC = () => {
  const sampleSignals = sampleCalls[0].signals;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <section className="hero isolate">
      <Suspense fallback={null}>
        <BackgroundCubesGrid
          className="pointer-events-none -z-10"
          cellSize={110}
          topColor="#0f1a2e"
          leftColor="#16243d"
          rightColor="#1b2e49"
          glowColor="#2dd4bf"
          glow={0.3}
        />
      </Suspense>
      <div className="container hero__grid">
        <div>
          <p className="eyebrow eyebrow--teal">Prototype in development</p>
          <h1>
            Spot{" "}
            <span className="sr-only">voice clones, replayed calls, and fake IDs</span>
            <span aria-hidden="true">
              <ContainerTextFlip
                words={fraudTypes}
                className="text-[0.85em]"
                textClassName="bg-[#203c49] font-semibold text-[var(--teal)]"
              />
            </span>
          </h1>
          <p className="hero__lead">
            We're building a verification API for Indian languages, helping lending apps, fintechs and gig platforms spot deepfake voices and fake identities. Starting with Hindi, expanding from there.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary" to="/login">
              Login to workspace
            </Link>
            <a
              className="btn btn--dark-ghost"
              href="#access"
              onClick={(e) => scrollToSection(e, "access")}
            >
              Request early access
            </a>
            <a
              className="btn btn--dark-ghost"
              href="#how"
              onClick={(e) => scrollToSection(e, "how")}
            >
              See how it works
            </a>
          </div>
        </div>

        <aside className="card sample-card" aria-label="Sample output">
          <p className="eyebrow">Sample output · illustrative</p>
          <div>
            {sampleSignals.map((sig) => (
              <SignalItem key={sig.id} signal={sig} />
            ))}
          </div>
          <p className="sample-card__foot">
            Risk signals with explanations. Your app decides; we recommend human review for edge cases.
          </p>
        </aside>
      </div>

      <Waveform count={120} seed={3} className="wave--band" />
      <div className="h-6" />
    </section>
  );
};

