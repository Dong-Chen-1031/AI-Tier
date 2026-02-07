import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 暫時禁用 React Compiler 以避免與 framer-motion 的兼容性問題
      // babel: {
      //   plugins: [["babel-plugin-react-compiler"]],
      // },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@/utils": path.resolve(__dirname, "./utils"),
      "@/types": path.resolve(__dirname, "./types"),
      "@/config": path.resolve(__dirname, "./config"),
      "@/pages": path.resolve(__dirname, "./pages"),
      "@/assets": path.resolve(__dirname, "./assets"),
      // 確保只使用一個 React 副本
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion"],
    force: true,
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
  },
});
