export { Animation, BorderRadius, BoxShadow, Brand, Colors, Components, DesignTokens, Spacing, Typography, animation, borderRadius, boxShadow, brand, colors, components, designTokens, spacing, typography } from './tokens.cjs';
export { createTailwindConfig, default as mandarinPathTailwindConfig } from './tailwind.config.cjs';
import 'tailwindcss';

/**
 * MandarinPath Design System
 * Shared branding and design tokens for all MandarinPath projects
 */

declare const utils: {
    /**
     * Generate consistent box shadow classes
     */
    getShadowClass: (level?: "soft" | "medium" | "large") => string;
    /**
     * Generate consistent button classes
     */
    getButtonClasses: (variant?: "primary" | "secondary", size?: "sm" | "md" | "lg") => string;
    /**
     * Generate consistent card classes
     */
    getCardClasses: (interactive?: boolean) => string;
    /**
     * Generate consistent input classes
     */
    getInputClasses: (hasError?: boolean) => string;
    /**
     * Generate logo element with consistent styling
     */
    getLogoClasses: (size?: "sm" | "md" | "lg") => string;
    /**
     * Generate consistent text color classes
     */
    getTextClasses: (variant?: "primary" | "secondary" | "muted" | "error" | "success") => string;
};
declare const cssStyles: {
    button: {
        primary: {
            backgroundColor: string;
            color: string;
            padding: string;
            borderRadius: string;
            border: string;
            fontWeight: string;
            cursor: string;
            transition: string;
            boxShadow: string;
            '&:hover': {
                backgroundColor: string;
                transform: string;
                boxShadow: string;
            };
        };
        secondary: {
            backgroundColor: string;
            color: string;
            padding: string;
            borderRadius: string;
            border: string;
            fontWeight: string;
            cursor: string;
            transition: string;
            boxShadow: string;
            '&:hover': {
                backgroundColor: string;
                borderColor: string;
                transform: string;
                boxShadow: string;
            };
        };
    };
    card: {
        backgroundColor: string;
        borderRadius: string;
        border: string;
        boxShadow: string;
        padding: string;
    };
    input: {
        padding: string;
        border: string;
        borderRadius: string;
        fontSize: string;
        transition: string;
        '&:focus': {
            outline: string;
            borderColor: string;
            boxShadow: string;
        };
    };
};
declare const _default: {
    cssStyles: {
        button: {
            primary: {
                backgroundColor: string;
                color: string;
                padding: string;
                borderRadius: string;
                border: string;
                fontWeight: string;
                cursor: string;
                transition: string;
                boxShadow: string;
                '&:hover': {
                    backgroundColor: string;
                    transform: string;
                    boxShadow: string;
                };
            };
            secondary: {
                backgroundColor: string;
                color: string;
                padding: string;
                borderRadius: string;
                border: string;
                fontWeight: string;
                cursor: string;
                transition: string;
                boxShadow: string;
                '&:hover': {
                    backgroundColor: string;
                    borderColor: string;
                    transform: string;
                    boxShadow: string;
                };
            };
        };
        card: {
            backgroundColor: string;
            borderRadius: string;
            border: string;
            boxShadow: string;
            padding: string;
        };
        input: {
            padding: string;
            border: string;
            borderRadius: string;
            fontSize: string;
            transition: string;
            '&:focus': {
                outline: string;
                borderColor: string;
                boxShadow: string;
            };
        };
    };
    /**
     * Generate consistent box shadow classes
     */
    getShadowClass: (level?: "soft" | "medium" | "large") => string;
    /**
     * Generate consistent button classes
     */
    getButtonClasses: (variant?: "primary" | "secondary", size?: "sm" | "md" | "lg") => string;
    /**
     * Generate consistent card classes
     */
    getCardClasses: (interactive?: boolean) => string;
    /**
     * Generate consistent input classes
     */
    getInputClasses: (hasError?: boolean) => string;
    /**
     * Generate logo element with consistent styling
     */
    getLogoClasses: (size?: "sm" | "md" | "lg") => string;
    /**
     * Generate consistent text color classes
     */
    getTextClasses: (variant?: "primary" | "secondary" | "muted" | "error" | "success") => string;
};

export { cssStyles, _default as default, utils };
