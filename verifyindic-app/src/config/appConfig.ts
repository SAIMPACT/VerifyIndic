import type { PlanConfig, LanguageItem, PricingCardPlan } from "@/types";

export interface AppConfig {
  gstRate: number;
  plans: Record<string, PlanConfig>;
  languages: LanguageItem[];
  pricingPlans: PricingCardPlan[];
}

export const appConfig: AppConfig = {
  // ---- PLANS (placeholder prices, before GST) ---------------------------
  gstRate: 0.18,
  plans: {
    monthly: { label: "Monthly", included: 500, overage: 6 },
    yearly: { label: "Yearly", included: 6000, overage: 5, used: 4020, renews: "12 Mar 2027" },
    team: { label: "Yearly · Multiple users", included: 20000, overage: 4 },
  },

  // ---- LANGUAGE COVERAGE (update only when true) ------------------------
  languages: [
    { name: "Hindi", status: "demo available", tone: "ok" },
    { name: "Marathi", status: "collecting data", tone: "warn" },
    { name: "Bengali", status: "collecting data", tone: "warn" },
    { name: "Tamil", status: "planned", tone: "plain" },
    { name: "Telugu", status: "planned", tone: "plain" },
    { name: "Kannada", status: "planned", tone: "plain" },
  ],

  // ---- PRICING CARDS ---------------------------------------------------
  pricingPlans: [
    {
      key: "monthly",
      title: "Pay per verification",
      price: "₹3",
      per: "/ verified call",
      sub: "Billed monthly",
      items: ["View verified calls and their charges in your dashboard"],
      cta: "Request access",
      href: "#access",
    },
  ],
};
