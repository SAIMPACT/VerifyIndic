import React from "react";

export const ProblemSection: React.FC = () => {
  return (
    <section className="section">
      <div className="container">
        <h2>Voice clones and fake IDs are reaching Indian lenders</h2>
        <p className="section__lead">
          Fraudsters now clone a voice from a few seconds of audio, or submit manipulated ID documents, to open accounts and move money on lending apps, fintechs and gig platforms. Most detection tools are tuned for English. We're focused on how Indian languages actually sound on real phone lines.
        </p>
        <div className="grid3">
          <div className="point">
            <h3>Voice-clone calls</h3>
            <p>Cloned voices used for loan and KYC calls.</p>
          </div>
          <div className="point">
            <h3>Fake or edited IDs</h3>
            <p>Manipulated document images at onboarding.</p>
          </div>
          <div className="point">
            <h3>Indic-language gap</h3>
            <p>Detectors degrade on languages, codecs and noise they haven't seen.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

