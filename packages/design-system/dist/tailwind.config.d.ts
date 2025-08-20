import { Config } from 'tailwindcss';

/**
 * MandarinPath Design System Tailwind Configuration
 * Provides consistent theming across all MandarinPath projects
 */
declare const mandarinPathTailwindConfig: Partial<Config>;

declare function createTailwindConfig(userConfig?: Partial<Config>): Config;

export { createTailwindConfig, mandarinPathTailwindConfig as default, mandarinPathTailwindConfig };
