import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false, // No minificar: facilita debugging para consumidores de la librería
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  target: 'es2020',
  external: [], // @dvge/core no tiene dependencias externas
});
