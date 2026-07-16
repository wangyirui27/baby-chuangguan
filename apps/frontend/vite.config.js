// apps/frontend/vite.config.js
// ─────────────────────────────────────────────────────────────────────────────
// Vite 配置 — serves root-level static SPA while proxying /api/*
//
// Mode selection:
//   npm run dev:mock → loads .env.mock  → proxy /api/* → localhost:3001
//   npm run dev:real  → loads .env.real → proxy /api/* → localhost:3000
//
// Business code always uses relative paths /api/* — mode switch is
// environment-only, zero code changes required.
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // loadEnv loads variables from .env.mock / .env.real based on mode arg.
  // mode is passed via: --mode mock | --mode real
  const env = loadEnv(mode, process.cwd(), '');
  const apiMode  = env.VITE_API_MODE  || 'mock';
  const apiBase  = env.VITE_API_BASE_URL || 'http://localhost:3000';

  const proxyTarget = apiMode === 'real' ? apiBase : 'http://localhost:3001';

  // eslint-disable-next-line no-console
  console.info(
    `[vite] mode=${mode}  VITE_API_MODE=${apiMode}  → proxy /api/* → ${proxyTarget}`
  );

  return {
    // Serve from the repo root where index.html lives.
    // All <script src="..."> and <link href="..."> resolve from here.
    // process.cwd() is apps/frontend, so go up two levels to the repo root.
    root: resolve(process.cwd(), '..', '..'),

    build: {
      outDir: 'apps/frontend/dist',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(process.cwd(), '..', '..', 'index.html'),
      },
    },

    preview: { port: 4173 },

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          // No path rewrite — /api stays /api
          configure: (proxy) => {
            proxy.on('proxyReq', (req) => {
              // Visible in dev for debugging
              if (process.env.VITE_DEBUG_PROXY) {
                // eslint-disable-next-line no-console
                console.debug(`[proxy] → ${req.method} ${req.path}`);
              }
            });
          },
        },
      },
    },

    define: {
      // Expose the effective API mode to client code as a build-time constant.
      // apiClient.js can reference this without a network request.
      'import.meta.env.VITE_API_MODE': JSON.stringify(apiMode),
    },
  };
});
