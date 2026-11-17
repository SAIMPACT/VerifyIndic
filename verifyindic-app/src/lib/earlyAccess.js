export const useCases = [
  "Voice-clone detection on KYC calls",
  "Fake ID / document checks",
  "Gig-platform onboarding",
  "Insurance claims calls",
  "Something else",
];

export const earlyAccessFields = ["name", "email", "company", "use"];

export const earlyAccessLimits = { name: 120, email: 254, company: 160 };

export function validateEarlyAccessField(field, value) {
  const trimmed = value.trim();

  switch (field) {
    case "name":
      return trimmed.length >= 2 && trimmed.length <= earlyAccessLimits.name
        ? ""
        : "Enter a name between 2 and 120 characters.";
    case "email":
      return trimmed.length <= earlyAccessLimits.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)
        ? ""
        : "Enter a valid email address.";
    case "company":
      return trimmed.length >= 2 && trimmed.length <= earlyAccessLimits.company
        ? ""
        : "Enter a company between 2 and 160 characters.";
    case "use":
      return useCases.some((useCase) => useCase === trimmed) ? "" : "Choose a use case.";
  }
}
