import React from "react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { SampleResultSection } from "@/components/landing/SampleResultSection";
import { LanguagesSection } from "@/components/landing/LanguagesSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { DocsSection } from "@/components/landing/DocsSection";
import { AccessFormSection } from "@/components/landing/AccessFormSection";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <LanguagesSection />
        <PricingSection />
        <DocsSection />
        <ProblemSection />
        <SampleResultSection />
        <TrustSection />
        <AccessFormSection />
      </main>

      <Footer />
    </div>
  );
};

