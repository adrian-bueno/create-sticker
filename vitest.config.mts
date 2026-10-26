import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    // Bind IPv4 explicitly: the crossOrigin tests also request images from
    // 127.0.0.1, which is refused when "localhost" resolves to ::1 only (CI).
    api: { host: '127.0.0.1' },
    include: ['test/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
