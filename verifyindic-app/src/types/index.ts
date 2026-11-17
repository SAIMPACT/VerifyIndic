export type Tone = "ok" | "warn" | "plain" | "high";

export interface LanguageItem {
  name: string;
  status: string;
  tone: Tone;
}

export interface PlanConfig {
  label: string;
  included: number;
  overage: number;
  used?: number;
  renews?: string;
}

export interface PricingCardPlan {
  key: string;
  price: string;
  per: string;
  sub: string;
  title?: string;
  hot?: boolean;
  flag?: string;
  items: string[];
  cta: string;
  href: string;
}

export interface User {
  name: string;
  initials: string;
  company: string;
  plan: "monthly" | "yearly" | "team" | string;
}

export type RiskLevelKey = "low" | "review" | "high";

export interface RiskLevel {
  key: RiskLevelKey;
  label: string;
}

export type SignalConfidence = "low" | "medium" | "high";

export interface Signal {
  id: string;
  name: string;
  score: number;
  confidence: SignalConfidence;
  level: RiskLevelKey;
  note: string;
}

export interface CallRecord {
  id: string;
  time: string;
  seconds: number;
  language: string;
  file: string;
  signals: Signal[];
  result: RiskLevel;
  charge: number;
}

export interface Invoice {
  id: string;
  label: string;
  amount: number;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  revoked: boolean;
}

export interface EarlyAccessFormData {
  name: string;
  email: string;
  company: string;
  useCase: string;
}

export type DashboardTab = "account" | "last" | "history" | "billing" | "keys" | "docs";

