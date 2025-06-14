import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  manifest: {
    permissions: ["tabs"],
    "content_security_policy": {
      "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self' 'wasm-unsafe-eval'; worker-src 'self' 'wasm-unsafe-eval';"
    },
  }
});
