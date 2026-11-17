/** Format rupees: 1234.5 -> ₹1,234.50 */
export function inr(n: number): string {
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Seconds -> m:ss */
export function dur(s: number): string {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

/** Date formats in IST-agnostic local style */
export function fmtDate(iso: string, withYear?: boolean): string {
  const d = new Date(iso);
  const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (withYear) opt.year = "numeric";
  return d.toLocaleDateString("en-IN", opt);
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
}

/** Seeded random for consistent waveforms */
function rng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** Generate waveform bar heights (percentage 6 to 100) */
export function generateWaveBars(count: number, seed: number = 7): number[] {
  const r = rng(seed);
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const env = 0.35 + 0.65 * Math.abs(Math.sin(i / 5.3 + seed)) * (0.5 + r());
    const h = Math.max(6, Math.min(100, Math.round(env * 100)));
    bars.push(h);
  }
  return bars;
}

/** Download text as file */
export function downloadFile(filename: string, content: string, type: string = "text/plain"): void {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
  }, 500);
}

/** Compute GST amount */
export function computeGst(amount: number, rate: number = 0.18): number {
  return Math.round(amount * rate * 100) / 100;
}

