import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: "./",
    server: {
        host: "0.0.0.0",
        port: 5173,
        open: true,
        proxy: {
            "/api": {
                target: "http://localhost:4030"
            },
            "/static": {
                target: "http://localhost:4030"
            }
        },
        watch: {
            ignored: [
                "**/node_modules/**",
                "**/.git/**",
                "__pycache__/**",
                "api/**",
                "static/**",
            ]
        }
    },
    plugins: [react({
        jsxImportSource: '@emotion/react',
    })],
    build: {
        sourcemap: true,
    }
})
