export const useCases: readonly string[];
export const earlyAccessFields: readonly ["name", "email", "company", "use"];
export type EarlyAccessField = (typeof earlyAccessFields)[number];
export type EarlyAccessValues = Record<EarlyAccessField, string>;
export const earlyAccessLimits: Record<Exclude<EarlyAccessField, "use">, number>;
export function validateEarlyAccessField(field: EarlyAccessField, value: string): string;
