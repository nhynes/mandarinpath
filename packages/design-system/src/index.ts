/**
 * MandarinPath Design System
 * Shared branding and design tokens for all MandarinPath projects
 */

// Export all design tokens
export * from './tokens.js'

// Export Tailwind configuration
export * from './tailwind.config.js'

// Utility functions for common design patterns
export const utils = {
  /**
   * Generate consistent box shadow classes
   */
  getShadowClass: (level: 'soft' | 'medium' | 'large' = 'soft') => {
    const shadowMap = {
      soft: 'shadow-soft',
      medium: 'shadow-medium', 
      large: 'shadow-large',
    }
    return shadowMap[level]
  },

  /**
   * Generate consistent button classes
   */
  getButtonClasses: (variant: 'primary' | 'secondary' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-soft hover:shadow-medium',
      secondary: 'bg-white text-secondary border border-border hover:bg-slate-50 hover:border-slate-300 focus:ring-secondary shadow-soft hover:shadow-medium',
    }
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-6 py-4 text-lg rounded-xl',
    }
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
  },

  /**
   * Generate consistent card classes
   */
  getCardClasses: (interactive: boolean = false) => {
    const baseClasses = 'bg-white rounded-2xl border border-border shadow-soft'
    const interactiveClasses = interactive 
      ? 'hover:shadow-medium hover:-translate-y-1 transition-all duration-200 cursor-pointer'
      : ''
    
    return `${baseClasses} ${interactiveClasses}`.trim()
  },

  /**
   * Generate consistent input classes
   */
  getInputClasses: (hasError: boolean = false) => {
    const baseClasses = 'block w-full px-4 py-3 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
    const stateClasses = hasError
      ? 'border-error focus:border-error focus:ring-error/20'
      : 'border-border focus:border-primary focus:ring-primary/20'
    
    return `${baseClasses} ${stateClasses}`
  },

  /**
   * Generate logo element with consistent styling
   */
  getLogoClasses: (size: 'sm' | 'md' | 'lg' = 'md') => {
    const baseClasses = 'inline-flex items-center justify-center bg-primary text-white font-bold shadow-soft transition-transform duration-200 hover:scale-105'
    
    const sizeClasses = {
      sm: 'h-8 w-8 text-lg rounded-lg',
      md: 'h-10 w-10 text-xl rounded-lg', 
      lg: 'h-12 w-12 text-2xl rounded-xl',
    }
    
    return `${baseClasses} ${sizeClasses[size]}`
  },

  /**
   * Generate consistent text color classes
   */
  getTextClasses: (variant: 'primary' | 'secondary' | 'muted' | 'error' | 'success' = 'primary') => {
    const variantMap = {
      primary: 'text-foreground',
      secondary: 'text-secondary',
      muted: 'text-muted',
      error: 'text-error',
      success: 'text-success',
    }
    
    return variantMap[variant]
  }
}

// CSS-in-JS styles for non-Tailwind environments
export const cssStyles = {
  button: {
    primary: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '&:hover': {
        backgroundColor: '#b91c1c',
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
    
    secondary: {
      backgroundColor: '#ffffff',
      color: '#374151',
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      border: '1px solid #d1d5db',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '&:hover': {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
        transform: 'translateY(-1px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    }
  },
  
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '1.5rem',
  },
  
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'all 0.2s',
    '&:focus': {
      outline: 'none',
      borderColor: '#dc2626',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
    }
  }
}

export default {
  ...utils,
  cssStyles,
}