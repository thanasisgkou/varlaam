import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

// Production URL on Cloudflare Workers/Pages. When the custom domain
// (e.g. varlaam.gr) is wired up, change this and redeploy — sitemap,
// canonical links, and og:image URLs all read from here.
export default defineConfig({
  integrations: [tailwind(), sitemap()],
  site: 'https://varlaam.thanasisgkou.workers.dev',
  adapter: cloudflare()
});