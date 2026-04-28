import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [vue()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_API_URL ?? "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
    // ← no define block needed
  };
});
