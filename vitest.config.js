import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Ищем только файлы *.test.js (например, utils.test.js)
    include: ['*.test.js'],
    // Явно игнорируем папку tests (где лежит Playwright) и node_modules
    exclude: ['node_modules', 'tg-ombre-proxy/node_modules', 'tests/**'],
  },
});