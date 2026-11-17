export function normalizePhone(value: string): string | undefined {
  const compact = value.replace(/[\s().-]/g, "");
  if (/^\d{10}$/.test(compact)) return "+91" + compact;
  if (/^91\d{10}$/.test(compact)) return "+" + compact;
  if (/^\+[1-9]\d{7,14}$/.test(compact)) return compact;
}
