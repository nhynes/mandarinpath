import type { Config } from 'tailwindcss'
import { colors, typography, spacing, borderRadius, boxShadow } from './tokens.js'

/**
 * MandarinPath Design System Tailwind Configuration
 * Provides consistent theming across all MandarinPath projects
 */
export const mandarinPathTailwindConfig: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        ...colors,
        // Convenience aliases for most common colors
        primary: colors.mandarin[600],
        'primary-hover': colors.mandarin[700],
        'primary-light': colors.mandarin[50],
        secondary: colors.slate[600],
        'secondary-hover': colors.slate[700],
        muted: colors.slate[500],
        background: colors.slate[50],
        foreground: colors.slate[900],
        border: colors.slate[200],
        'border-muted': colors.slate[100],
        
        // Semantic aliases
        success: colors.semantic.success,
        warning: colors.semantic.warning,
        error: colors.semantic.error,
        info: colors.semantic.info,
      },
      
      fontFamily: {
        display: [...typography.fontFamily.display],
        body: [...typography.fontFamily.body],
        mono: [...typography.fontFamily.mono],
      },
      
      fontSize: typography.fontSize,
      
      fontWeight: typography.fontWeight,
      
      lineHeight: typography.lineHeight,
      
      letterSpacing: typography.letterSpacing,
      
      spacing,
      
      borderRadius,
      
      boxShadow,
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Background gradients as utilities
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%)',
        'gradient-hero': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      },
    },
  },
  
  plugins: [],
}

// Export as default for easier importing
export default mandarinPathTailwindConfig

// Export a function that creates a complete Tailwind config
export function createTailwindConfig(userConfig: Partial<Config> = {}): Config {
  const baseConfig: Config = {
    content: [],
    theme: mandarinPathTailwindConfig.theme,
    plugins: mandarinPathTailwindConfig.plugins || [],
  }
  
  return {
    ...baseConfig,
    ...userConfig,
    theme: {
      ...baseConfig.theme,
      ...userConfig.theme,
      extend: {
        ...baseConfig.theme?.extend,
        ...userConfig.theme?.extend,
      },
    },
    plugins: [
      ...(baseConfig.plugins || []),
      ...(userConfig.plugins || []),
    ],
  }
}