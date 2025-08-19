# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the MandarinPath landing page.

## Project Overview

This is an Astro-based landing page for MandarinPath, a Chinese language learning application. The landing page is designed for SEO optimization and will be served at the root domain (`mandarinpath.com`), while the Vue.js application will be served at `app.mandarinpath.com`.

## Development Commands

**Essential Commands:**
- `pnpm dev` - Start development server at localhost:4321
- `pnpm build` - Build production site (includes type checking)
- `pnpm lint` - Run prettier check and Astro type checking
- `pnpm lint:fix` - Auto-fix formatting issues with prettier
- `pnpm check` or `pnpm type-check` - Run Astro type checking only

## Architecture

**Framework Stack:**
- Astro 5.x with TypeScript for static site generation
- Tailwind CSS for styling with custom MandarinPath theme
- Sitemap generation for SEO

**Key Features:**
- Fully static pages for optimal SEO
- Custom color palette with `mandarin` and `brand` color scales
- Responsive design optimized for all devices
- Clean, modern design focused on Chinese language learning

**Content Structure:**
- `src/pages/index.astro` - Main landing page
- `src/layouts/Layout.astro` - Base layout with SEO meta tags
- `src/components/` - Reusable components (Header, Footer)

**SEO Optimization:**
- Semantic HTML structure
- Open Graph and Twitter Card meta tags  
- Proper heading hierarchy
- Descriptive alt texts and ARIA labels
- Fast loading with minimal JavaScript
- Sitemap generation

**Design Philosophy:**
- Focus on MandarinPath's core learning philosophy: no pressure, intelligent difficulty, real-world skills
- Clear call-to-actions directing to `app.mandarinpath.com`
- Chinese character (中) branding elements
- Professional yet approachable tone

## Development Notes

**CRITICAL: After completing ANY set of changes, ALWAYS run `pnpm lint:fix` and `pnpm check` to ensure code quality and TypeScript compilation.**

- Site configured for `https://mandarinpath.com` deployment
- App references point to `https://app.mandarinpath.com`
- No blog or documentation sections (hidden as requested)
- Minimal JavaScript for optimal performance
- All content optimized for Chinese language learning audience