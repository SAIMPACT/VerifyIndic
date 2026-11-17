export default {
  fetch(request: Request) {
    const headers = { "Cache-Control": "no-store" };
    if (request.method !== "GET") {
      return Response.json({ error: "Use GET." }, { status: 405, headers: { ...headers, Allow: "GET" } });
    }

    const url = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey?.startsWith("sb_publishable_")) {
      return Response.json({ error: "Sign-in is unavailable." }, { status: 503, headers });
    }

    return Response.json({ url, publishableKey }, { headers });
  },
};
