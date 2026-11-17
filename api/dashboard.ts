function reply(status: number, body: object, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export default {
  async fetch(request: Request) {
    if (request.method !== "GET") {
      return reply(405, { error: "Use GET." }, { Allow: "GET" });
    }

    const authorization = request.headers.get("authorization");
    if (!authorization || !/^Bearer [^\s]+$/i.test(authorization)) {
      return reply(401, { error: "Sign in to access your workspace." });
    }

    const callId = new URL(request.url).searchParams.get("callId");
    if (callId !== null && !/^[A-Za-z0-9_-]{1,100}$/.test(callId)) {
      return reply(400, { error: "Invalid call ID." });
    }

    const url = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey?.startsWith("sb_publishable_")) {
      return reply(503, { error: "The dashboard is unavailable. Please try again." });
    }

    try {
      // PostgREST verifies the access token and runs the query under that user's RLS policies.
      const response = await fetch(new URL("/rest/v1/rpc/get_workspace_dashboard", url), {
        method: "POST",
        headers: {
          apikey: publishableKey,
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_call_id: callId }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.status === 401 || response.status === 403) {
        return reply(401, { error: "Sign in again to access your workspace." });
      }
      if (!response.ok) {
        console.error("Workspace database request failed.", response.status);
        return reply(503, { error: "The dashboard is unavailable. Please try again." });
      }

      const dashboard: unknown = await response.json();
      if (!dashboard || typeof dashboard !== "object" || !("workspace" in dashboard)) {
        return reply(503, { error: "The dashboard is unavailable. Please try again." });
      }
      if (!dashboard.workspace) {
        return reply(403, { error: "Your account hasn’t been assigned to a workspace." });
      }
      if (!("calls" in dashboard) || !Array.isArray(dashboard.calls)) {
        return reply(503, { error: "The dashboard is unavailable. Please try again." });
      }
      if (callId !== null && dashboard.calls.length === 0) {
        return reply(404, { error: "Call not found." });
      }

      return reply(200, dashboard);
    } catch {
      return reply(503, { error: "The dashboard is unavailable. Please try again." });
    }
  },
};
