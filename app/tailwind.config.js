import { createTailwindConfig } from '@mandarinpath/design-system/tailwind'

/** @type {import('tailwindcss').Config} */
export default createTailwindConfig({
  content: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
})