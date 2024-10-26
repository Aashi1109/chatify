import react from "@vitejs/plugin-react-swc";
import path from "path";
import {defineConfig} from "vite";

/** @type {import('vite').UserConfig} */
export default () => {
    // process.env = { ...process.env, ...loadEnv(mode, process.cwd() + "/client") };
    return defineConfig({
        plugins: [react(),],
        envDir: ".",
        server: {
            port: 3000,
            proxy: {
                "/api": {
                    target: "http://localhost:5000/api/",
                    secure: false,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ""),
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
