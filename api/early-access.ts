import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { earlyAccessFields, validateEarlyAccessField, type EarlyAccessValues } from "../verifyindic-app/src/lib/earlyAccess.js";

const maxBodyBytes = 4096;
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function reply(status: number, body: object, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

async function handleEarlyAccess(request: Request) {
  if (request.method !== "POST") {
    return reply(405, { error: "Use POST to submit a request." }, { Allow: "POST" });
  }

  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply(415, { error: "Send a JSON request." });
  }

  if (Number(request.headers.get("content-length")) > maxBodyBytes) {
    return reply(413, { error: "The request is too large." });
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > maxBodyBytes) {
      return reply(413, { error: "The request is too large." });
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return reply(400, { error: "Enter all required fields." });
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return reply(400, { error: "Send a valid JSON request." });
  }

  const requestId = payload.requestId;
  if (typeof requestId !== "string" || !requestIdPattern.test(requestId)) {
    return reply(400, { error: "Invalid request ID." });
  }

  const fields: EarlyAccessValues = { name: "", email: "", company: "", use: "" };
  for (const field of earlyAccessFields) {
    const input = payload[field];
    const value = typeof input === "string" ? input.trim() : "";
    const error = validateEarlyAccessField(field, value);
    if (error || value.includes("\0")) {
      return reply(400, { error: error || "Remove invalid characters." });
    }
    fields[field] = value;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Early access storage configuration is missing.");
    return reply(503, { error: "Couldn’t save your request. Please try again." });
  }

  const forwardedIp = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") : null;
  const ip = forwardedIp && isIP(forwardedIp) ? forwardedIp : "unknown";
  const sourceHash = createHmac("sha256", supabaseKey).update("early-access:" + ip).digest("hex");

  try {
    const response = await fetch(new URL("/rest/v1/rpc/submit_early_access", supabaseUrl), {
      method: "POST",
      headers: { apikey: supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        p_request_id: requestId,
        p_name: fields.name,
        p_email: fields.email.toLowerCase(),
        p_company: fields.company,
        p_use_case: fields.use,
        p_source_hash: sourceHash,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const result: unknown = await response.json();
      if (result === "saved" || result === "duplicate") {
        return reply(result === "saved" ? 201 : 200, { saved: true });
      }
      if (result === "limited") {
        return reply(429, { error: "Too many requests. Please try again later." }, { "Retry-After": "3600" });
      }
      if (result === "conflict") {
        return reply(409, { error: "This request changed. Please try again." });
      }
    }
    console.error("Early access storage returned an unexpected result.", response.status);
  } catch {
    console.error("Early access storage request failed.");
  }

  return reply(503, { error: "Couldn’t save your request. Please try again." });
}

export default { fetch: handleEarlyAccess };
