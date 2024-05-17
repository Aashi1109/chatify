import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

/** @type {import('vite').UserConfig} */
export default ({ mode }: { mode: string }) => {
  // process.env = { ...process.env, ...loadEnv(mode, process.cwd() + "/client") };
  return defineConfig({
    plugins: [react(), tsConfigPaths()],
    envDir: ".",
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // define: {
    //   "process.env": {},
    // },
  });
};
