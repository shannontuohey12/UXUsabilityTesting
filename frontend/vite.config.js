
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                app: resolve(import.meta.dirname, "index.html"),
                taskOverlay: resolve(import.meta.dirname, "src/taskOverlayEntry.jsx")
            },
            output: {
                entryFileNames: "assets/[name].js"
            }
        }
    }
});
