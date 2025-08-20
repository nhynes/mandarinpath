# MandarinPath Design System

A comprehensive design system package that ensures consistent branding and UI patterns across all MandarinPath projects.

## 🎨 Features

- **Consistent Design Tokens**: Colors, typography, spacing, and more
- **Tailwind Integration**: Pre-configured Tailwind CSS setup
- **Component Utilities**: Helper functions for common UI patterns
- **TypeScript Support**: Full type safety for all design tokens
- **CSS-in-JS Support**: For non-Tailwind environments

## 📦 Installation

```bash
pnpm add @mandarinpath/design-system
```

## 🚀 Usage

### Tailwind CSS Integration

```javascript
// tailwind.config.js
import { createTailwindConfig } from '@mandarinpath/design-system/tailwind'

export default createTailwindConfig({
  content: ['./src/**/*.{vue,js,ts,jsx,tsx,astro,html}'],
  // Your custom config here
})
```

### Design Tokens

```typescript
import { colors, typography, spacing } from '@mandarinpath/design-system/tokens'

// Access design tokens
const primaryColor = colors.mandarin[600] // #dc2626
const bodyFont = typography.fontFamily.body // ['Inter', 'system-ui', 'sans-serif']
```

### Component Utilities

```typescript
import { utils } from '@mandarinpath/design-system'

// Generate consistent button classes
const buttonClass = utils.getButtonClasses('primary', 'md')

// Generate card classes with hover effects
const cardClass = utils.getCardClasses(true) // interactive: true

// Generate logo classes
const logoClass = utils.getLogoClasses('md')
```

### CSS-in-JS Styles

```typescript
import { cssStyles } from '@mandarinpath/design-system'

// Use in styled-components, emotion, etc.
const StyledButton = styled.button`
  ${cssStyles.button.primary}
`
```

## 🎯 Design System Values

### Brand Colors

- **Primary**: `mandarin-600` (#dc2626) - Main brand color
- **Secondary**: `slate-600` (#475569) - Supporting text
- **Background**: `slate-50` (#f8fafc) - Page backgrounds

### Typography

- **Font Family**: Inter (system fallbacks included)
- **Sizes**: Consistent scale from `xs` (0.75rem) to `6xl` (3.75rem)
- **Weights**: Light (300) to Extrabold (800)

### Component Standards

- **Buttons**: Rounded corners (`rounded-xl`), consistent padding, hover effects
- **Cards**: White backgrounds, subtle shadows, rounded corners (`rounded-2xl`)
- **Inputs**: Consistent padding, focus states with brand colors

### Chinese Language Considerations

- **Logo Character**: 中 (zhōng) - representing Chinese language
- **Color Psychology**: Red (mandarin) conveys good fortune and energy in Chinese culture
- **Typography**: Optimized for mixed Chinese/English content

## 🔧 Development

```bash
# Build the package
pnpm build

# Watch for changes during development
pnpm dev

# Type checking
pnpm type-check
```

## 📁 Package Structure

```
src/
├── tokens.ts          # Design tokens (colors, typography, etc.)
├── tailwind.config.ts # Tailwind configuration
└── index.ts           # Main exports and utilities
```

## 🎨 Tailwind Classes Available

The design system extends Tailwind with:

- `bg-primary`, `text-primary` - Brand colors
- `shadow-soft`, `shadow-medium` - Consistent shadows  
- `font-display` - Brand typography
- Custom animations and transitions

## ✨ Example Components

### Button Component (Vue)

```vue
<template>
  <button :class="buttonClasses">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { utils } from '@mandarinpath/design-system'

const props = defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}>()

const buttonClasses = computed(() => 
  utils.getButtonClasses(props.variant ?? 'primary', props.size ?? 'md')
)
</script>
```

### Card Component (Astro)

```astro
---
import { utils } from '@mandarinpath/design-system'
const cardClasses = utils.getCardClasses(true) // interactive
---

<div class={cardClasses}>
  <slot />
</div>
```

This ensures all MandarinPath projects maintain consistent, professional, and culturally-appropriate design patterns.