import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import authConfig from "../api/auth-config";
import dashboard from "../api/dashboard";

function localAuthApi(): Plugin {
  return {
    name: "verifyindic-local-auth",
    apply: "serve",
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.envDir, "SUPABASE_");
      for (const name of ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"]) {
        if (env[name]) process.env[name] ??= env[name];
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const handler = url.pathname === "/api/auth-config" ? authConfig
          : url.pathname === "/api/dashboard" ? dashboard : undefined;
        if (!handler) return next();

        try {
          const headers = new Headers();
          if (req.headers.authorization) headers.set("Authorization", req.headers.authorization);
          const response = await handler.fetch(new Request(url, { method: req.method, headers }));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localAuthApi(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

