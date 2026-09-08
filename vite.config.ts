import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    conditions: ["workerd", "worker", "browser"],
    alias: {
      "@cf-wasm/photon/workerd": path.resolve(
        root,
        "node_modules/@cf-wasm/photon/dist/workerd.js",
      ),
      "@cf-wasm/photon/node": path.resolve(
        root,
        "node_modules/@cf-wasm/photon/dist/node.js",
      ),
    },
  },
  plugins: [
    vinext({
      cache: { data: kvDataAdapter(), cdn: cdnAdapter() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
