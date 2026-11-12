import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { projectsApi } from "./projects-api.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), projectsApi()],
  base: "./",
});
