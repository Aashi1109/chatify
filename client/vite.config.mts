import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */
export default () => {
  // process.env = { ...process.env, ...loadEnv(mode, process.cwd() + "/client") };
  return defineConfig({
    plugins: [react()],
    envDir: ".",
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:3001/api/",
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/socket.io": {
          target: "http://localhost:3001", // your backend server URL
          changeOrigin: true,
          ws: true, // this is important for WebSocket support
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
