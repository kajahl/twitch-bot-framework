import { defineConfig } from 'tsup'

export default defineConfig({
    format: ['cjs', 'esm'],
    entryPoints: ['index.ts'],
    outDir: 'dist',
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
})