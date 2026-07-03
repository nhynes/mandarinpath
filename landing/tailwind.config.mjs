import { createTailwindConfig } from '@mandarinpath/design-system/tailwind'

/** @type {import('tailwindcss').Config} */
export default createTailwindConfig({
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
});
