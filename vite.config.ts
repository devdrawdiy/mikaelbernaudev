import { defineConfig } from "vite";
import { resolve } from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        sampleminigame: resolve(__dirname, "sampleminigame/index.html")
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) return "three";
            if (id.includes("pdfjs-dist")) return "pdfjs";
            if (id.includes("@fortawesome")) return "icons";
            return "vendor";
          }
        }
      }
    }
  }
});
