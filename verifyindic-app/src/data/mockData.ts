import type { CallRecord, RiskLevel, RiskLevelKey, Signal, SignalConfidence, Invoice, ApiKey } from "@/types";

export function level(score: number): RiskLevel {
  if (score < 0.35) return { key: "low", label: "Low concern" };
  if (score < 0.7) return { key: "review", label: "Review" };
  return { key: "high", label: "Elevated risk" };
}

type RawCall = [string, string, number, number, number, number, string];

const RAW_CALLS: RawCall[] = [
  ["call_8F2A91", "2026-11-03T18:42:00+05:30", 8, 0.22, 0.48, 0.65, "mml"],
  ["call_8F2A7C", "2026-11-03T17:15:00+05:30", 41, 0.14, 0.2, 0.18, "hhm"],
  ["call_8F29E4", "2026-11-03T15:58:00+05:30", 27, 0.19, 0.24, 0.12, "hmh"],
  ["call_8F29B0", "2026-11-03T14:20:00+05:30", 63, 0.78, 0.55, 0.31, "mmh"],
  ["call_8F2977", "2026-11-03T12:05:00+05:30", 35, 0.11, 0.16, 0.22, "hhh"],
  ["call_8F2912", "2026-11-03T10:31:00+05:30", 19, 0.41, 0.62, 0.38, "mlm"],
  ["call_8F28D8", "2026-11-02T19:48:00+05:30", 52, 0.09, 0.21, 0.15, "hhh"],
  ["call_8F2864", "2026-11-02T16:12:00+05:30", 14, 0.52, 0.44, 0.74, "mml"],
  ["call_8F2820", "2026-11-02T13:40:00+05:30", 48, 0.17, 0.12, 0.2, "hhm"],
  ["call_8F27AF", "2026-11-02T11:09:00+05:30", 29, 0.23, 0.31, 0.19, "hmh"],
  ["call_8F2751", "2026-11-01T18:25:00+05:30", 22, 0.33, 0.58, 0.27, "mmm"],
  ["call_8F26EE", "2026-11-01T15:02:00+05:30", 57, 0.08, 0.14, 0.11, "hhh"],
];

const CONF_MAP: Record<string, SignalConfidence> = {
  h: "high",
  m: "medium",
  l: "low",
};

const NOTES: Record<string, Record<RiskLevelKey, string>> = {
  voice: {
    low: "Low concern. Prosody and breathing look consistent with natural speech.",
    review: "Review. Prosody looks flat in places; compare with a known sample.",
    high: "Elevated. Speech rhythm resembles synthetic voice output.",
  },
  codec: {
    low: "Low concern. Compression pattern is typical for a phone call.",
    review: "Review. Compression pattern is unusual for a phone call.",
    high: "Elevated. Audio shows re-encoding traces not typical for a phone call.",
  },
  replay: {
    low: "Low concern. No cues of a replayed recording.",
    review: "Review. Some cues resemble a replayed recording.",
    high: "Elevated. Strong cues of a replayed recording.",
  },
};

const NAMES: Record<string, string> = {
  voice: "Voice naturalness",
  codec: "Channel & codec traces",
  replay: "Replay / liveness cues",
};

export const sampleCalls: CallRecord[] = RAW_CALLS.map((r) => {
  const keys = ["voice", "codec", "replay"];
  const scores = [r[3], r[4], r[5]];
  const confStr = r[6];

  const signals: Signal[] = keys.map((k, i) => {
    const lv = level(scores[i]);
    const confChar = confStr[i] || "m";
    const confidence = CONF_MAP[confChar] || "medium";
    return {
      id: k,
      name: NAMES[k],
      score: scores[i],
      confidence,
      level: lv.key,
      note: NOTES[k][lv.key],
    };
  });

  const worst = Math.max(...scores);
  return {
    id: r[0],
    time: r[1],
    seconds: r[2],
    language: "Hindi",
    file: `sample_${r[0]}.wav`,
    signals,
    result: level(worst),
    charge: 5,
  };
});

export const sampleInvoices: Invoice[] = [
  { id: "INV-2026-11", label: "Nov 2026 (so far)", amount: 15 },
  { id: "INV-2026-03", label: "Yearly plan · Mar 2026", amount: 49999 },
];

export const initialApiKeys: ApiKey[] = [
  { id: "k1", name: "Production", prefix: "vi_live_9c41", created: "14 Mar 2026", revoked: false },
  { id: "k2", name: "Sandbox", prefix: "vi_test_77ab", created: "14 Mar 2026", revoked: false },
];

