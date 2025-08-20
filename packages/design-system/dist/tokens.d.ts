/**
 * MandarinPath Design System - Design Tokens
 * Central source of truth for all design values
 */
declare const colors: {
    readonly brand: {
        readonly 50: "#f0f9ff";
        readonly 100: "#e0f2fe";
        readonly 200: "#bae6fd";
        readonly 300: "#7dd3fc";
        readonly 400: "#38bdf8";
        readonly 500: "#0ea5e9";
        readonly 600: "#0284c7";
        readonly 700: "#0369a1";
        readonly 800: "#075985";
        readonly 900: "#0c4a6e";
    };
    readonly mandarin: {
        readonly 50: "#fef2f2";
        readonly 100: "#fee2e2";
        readonly 200: "#fecaca";
        readonly 300: "#fca5a5";
        readonly 400: "#f87171";
        readonly 500: "#ef4444";
        readonly 600: "#dc2626";
        readonly 700: "#b91c1c";
        readonly 800: "#991b1b";
        readonly 900: "#7f1d1d";
    };
    readonly slate: {
        readonly 50: "#f8fafc";
        readonly 100: "#f1f5f9";
        readonly 200: "#e2e8f0";
        readonly 300: "#cbd5e1";
        readonly 400: "#94a3b8";
        readonly 500: "#64748b";
        readonly 600: "#475569";
        readonly 700: "#334155";
        readonly 800: "#1e293b";
        readonly 900: "#0f172a";
    };
    readonly semantic: {
        readonly success: "#10b981";
        readonly warning: "#f59e0b";
        readonly error: "#ef4444";
        readonly info: "#3b82f6";
    };
};
declare const typography: {
    readonly fontFamily: {
        readonly display: readonly ["Inter", "system-ui", "sans-serif"];
        readonly body: readonly ["Inter", "system-ui", "sans-serif"];
        readonly mono: readonly ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"];
    };
    readonly fontSize: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
        readonly '5xl': "3rem";
        readonly '6xl': "3.75rem";
    };
    readonly fontWeight: {
        readonly light: "300";
        readonly normal: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
        readonly extrabold: "800";
    };
    readonly lineHeight: {
        readonly tight: "1.25";
        readonly snug: "1.375";
        readonly normal: "1.5";
        readonly relaxed: "1.625";
        readonly loose: "2";
    };
    readonly letterSpacing: {
        readonly tighter: "-0.05em";
        readonly tight: "-0.025em";
        readonly normal: "0em";
        readonly wide: "0.025em";
        readonly wider: "0.05em";
        readonly widest: "0.1em";
    };
};
declare const spacing: {
    readonly 0: "0px";
    readonly 1: "0.25rem";
    readonly 2: "0.5rem";
    readonly 3: "0.75rem";
    readonly 4: "1rem";
    readonly 5: "1.25rem";
    readonly 6: "1.5rem";
    readonly 8: "2rem";
    readonly 10: "2.5rem";
    readonly 12: "3rem";
    readonly 16: "4rem";
    readonly 20: "5rem";
    readonly 24: "6rem";
    readonly 32: "8rem";
    readonly 40: "10rem";
    readonly 48: "12rem";
    readonly 56: "14rem";
    readonly 64: "16rem";
};
declare const borderRadius: {
    readonly none: "0px";
    readonly sm: "0.125rem";
    readonly default: "0.25rem";
    readonly md: "0.375rem";
    readonly lg: "0.5rem";
    readonly xl: "0.75rem";
    readonly '2xl': "1rem";
    readonly '3xl': "1.5rem";
    readonly full: "9999px";
};
declare const boxShadow: {
    readonly soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    readonly medium: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    readonly large: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
};
declare const animation: {
    readonly duration: {
        readonly fast: "0.15s";
        readonly normal: "0.2s";
        readonly slow: "0.3s";
    };
    readonly easing: {
        readonly linear: "linear";
        readonly in: "cubic-bezier(0.4, 0, 1, 1)";
        readonly out: "cubic-bezier(0, 0, 0.2, 1)";
        readonly inOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
declare const components: {
    readonly button: {
        readonly borderRadius: "0.75rem";
        readonly padding: {
            readonly sm: "0.5rem 0.75rem";
            readonly md: "0.75rem 1rem";
            readonly lg: "1rem 1.5rem";
        };
        readonly fontSize: {
            readonly sm: "0.875rem";
            readonly md: "1rem";
            readonly lg: "1.125rem";
        };
    };
    readonly card: {
        readonly borderRadius: "1rem";
        readonly padding: "1.5rem";
        readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    };
    readonly modal: {
        readonly borderRadius: "1rem";
        readonly shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
        readonly padding: "1.5rem";
    };
    readonly input: {
        readonly borderRadius: "0.5rem";
        readonly padding: "0.75rem 1rem";
        readonly fontSize: "1rem";
    };
};
declare const brand: {
    readonly logo: {
        readonly character: "中";
        readonly backgroundColor: "#dc2626";
        readonly color: "#ffffff";
        readonly borderRadius: "0.5rem";
        readonly size: {
            readonly sm: "2rem";
            readonly md: "2.5rem";
            readonly lg: "3rem";
        };
    };
    readonly gradients: {
        readonly primary: "linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%)";
        readonly hero: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
        readonly card: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
    };
};
declare const designTokens: {
    readonly colors: {
        readonly brand: {
            readonly 50: "#f0f9ff";
            readonly 100: "#e0f2fe";
            readonly 200: "#bae6fd";
            readonly 300: "#7dd3fc";
            readonly 400: "#38bdf8";
            readonly 500: "#0ea5e9";
            readonly 600: "#0284c7";
            readonly 700: "#0369a1";
            readonly 800: "#075985";
            readonly 900: "#0c4a6e";
        };
        readonly mandarin: {
            readonly 50: "#fef2f2";
            readonly 100: "#fee2e2";
            readonly 200: "#fecaca";
            readonly 300: "#fca5a5";
            readonly 400: "#f87171";
            readonly 500: "#ef4444";
            readonly 600: "#dc2626";
            readonly 700: "#b91c1c";
            readonly 800: "#991b1b";
            readonly 900: "#7f1d1d";
        };
        readonly slate: {
            readonly 50: "#f8fafc";
            readonly 100: "#f1f5f9";
            readonly 200: "#e2e8f0";
            readonly 300: "#cbd5e1";
            readonly 400: "#94a3b8";
            readonly 500: "#64748b";
            readonly 600: "#475569";
            readonly 700: "#334155";
            readonly 800: "#1e293b";
            readonly 900: "#0f172a";
        };
        readonly semantic: {
            readonly success: "#10b981";
            readonly warning: "#f59e0b";
            readonly error: "#ef4444";
            readonly info: "#3b82f6";
        };
    };
    readonly typography: {
        readonly fontFamily: {
            readonly display: readonly ["Inter", "system-ui", "sans-serif"];
            readonly body: readonly ["Inter", "system-ui", "sans-serif"];
            readonly mono: readonly ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"];
        };
        readonly fontSize: {
            readonly xs: "0.75rem";
            readonly sm: "0.875rem";
            readonly base: "1rem";
            readonly lg: "1.125rem";
            readonly xl: "1.25rem";
            readonly '2xl': "1.5rem";
            readonly '3xl': "1.875rem";
            readonly '4xl': "2.25rem";
            readonly '5xl': "3rem";
            readonly '6xl': "3.75rem";
        };
        readonly fontWeight: {
            readonly light: "300";
            readonly normal: "400";
            readonly medium: "500";
            readonly semibold: "600";
            readonly bold: "700";
            readonly extrabold: "800";
        };
        readonly lineHeight: {
            readonly tight: "1.25";
            readonly snug: "1.375";
            readonly normal: "1.5";
            readonly relaxed: "1.625";
            readonly loose: "2";
        };
        readonly letterSpacing: {
            readonly tighter: "-0.05em";
            readonly tight: "-0.025em";
            readonly normal: "0em";
            readonly wide: "0.025em";
            readonly wider: "0.05em";
            readonly widest: "0.1em";
        };
    };
    readonly spacing: {
        readonly 0: "0px";
        readonly 1: "0.25rem";
        readonly 2: "0.5rem";
        readonly 3: "0.75rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 8: "2rem";
        readonly 10: "2.5rem";
        readonly 12: "3rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 32: "8rem";
        readonly 40: "10rem";
        readonly 48: "12rem";
        readonly 56: "14rem";
        readonly 64: "16rem";
    };
    readonly borderRadius: {
        readonly none: "0px";
        readonly sm: "0.125rem";
        readonly default: "0.25rem";
        readonly md: "0.375rem";
        readonly lg: "0.5rem";
        readonly xl: "0.75rem";
        readonly '2xl': "1rem";
        readonly '3xl': "1.5rem";
        readonly full: "9999px";
    };
    readonly boxShadow: {
        readonly soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        readonly medium: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        readonly large: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
    };
    readonly animation: {
        readonly duration: {
            readonly fast: "0.15s";
            readonly normal: "0.2s";
            readonly slow: "0.3s";
        };
        readonly easing: {
            readonly linear: "linear";
            readonly in: "cubic-bezier(0.4, 0, 1, 1)";
            readonly out: "cubic-bezier(0, 0, 0.2, 1)";
            readonly inOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        };
    };
    readonly components: {
        readonly button: {
            readonly borderRadius: "0.75rem";
            readonly padding: {
                readonly sm: "0.5rem 0.75rem";
                readonly md: "0.75rem 1rem";
                readonly lg: "1rem 1.5rem";
            };
            readonly fontSize: {
                readonly sm: "0.875rem";
                readonly md: "1rem";
                readonly lg: "1.125rem";
            };
        };
        readonly card: {
            readonly borderRadius: "1rem";
            readonly padding: "1.5rem";
            readonly shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        };
        readonly modal: {
            readonly borderRadius: "1rem";
            readonly shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
            readonly padding: "1.5rem";
        };
        readonly input: {
            readonly borderRadius: "0.5rem";
            readonly padding: "0.75rem 1rem";
            readonly fontSize: "1rem";
        };
    };
    readonly brand: {
        readonly logo: {
            readonly character: "中";
            readonly backgroundColor: "#dc2626";
            readonly color: "#ffffff";
            readonly borderRadius: "0.5rem";
            readonly size: {
                readonly sm: "2rem";
                readonly md: "2.5rem";
                readonly lg: "3rem";
            };
        };
        readonly gradients: {
            readonly primary: "linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%)";
            readonly hero: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
            readonly card: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
        };
    };
};
type Colors = typeof colors;
type Typography = typeof typography;
type Spacing = typeof spacing;
type BorderRadius = typeof borderRadius;
type BoxShadow = typeof boxShadow;
type Animation = typeof animation;
type Components = typeof components;
type Brand = typeof brand;
type DesignTokens = typeof designTokens;

export { type Animation, type BorderRadius, type BoxShadow, type Brand, type Colors, type Components, type DesignTokens, type Spacing, type Typography, animation, borderRadius, boxShadow, brand, colors, components, designTokens, spacing, typography };
