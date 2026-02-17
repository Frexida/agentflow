// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://frexida.github.io',
  base: process.env.BASE_PATH || '/agentflow',
  server: { host: '0.0.0.0' },
});
