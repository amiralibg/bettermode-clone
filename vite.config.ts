import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/graphql": {
        target: "https://api.bettermode.com/graphql",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/graphql/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            // Set required headers for BetterMode API
            proxyReq.setHeader(
              "X-Network-Domain",
              "basic-c5hx2lyj.bettermode.io",
            );
            proxyReq.setHeader(
              "Origin",
              "https://basic-c5hx2lyj.bettermode.io",
            );
            proxyReq.setHeader(
              "Referer",
              "https://basic-c5hx2lyj.bettermode.io",
            );

            // Preserve the original authorization header if it exists
            const authHeader = req.headers.authorization;
            if (authHeader) {
              proxyReq.setHeader("Authorization", authHeader);
            }

            // Handle POST requests
            if (req.method === "POST") {
              proxyReq.setHeader("Content-Type", "application/json");
            }
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
