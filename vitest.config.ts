import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json'],
      include: ['src/**/*.ts'],
      exclude: ['src/visualSkills.ts'], // Archivo de datos, no lógica testeable
    },
  },
});
