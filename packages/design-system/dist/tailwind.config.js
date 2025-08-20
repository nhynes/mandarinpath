// src/tokens.ts
var colors = {
  // Brand colors - Primary red/mandarin palette
  brand: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e"
  },
  // Mandarin red - Primary brand color
  mandarin: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    // Primary brand color
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d"
  },
  // Neutral colors - Modern slate palette
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a"
  },
  // Semantic colors
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6"
  }
};
var typography = {
  fontFamily: {
    display: ["Inter", "system-ui", "sans-serif"],
    body: ["Inter", "system-ui", "sans-serif"],
    mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"]
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem"
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800"
  },
  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2"
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em"
  }
};
var spacing = {
  0: "0px",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  56: "14rem",
  64: "16rem"
};
var borderRadius = {
  none: "0px",
  sm: "0.125rem",
  default: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px"
};
var boxShadow = {
  soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  medium: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  large: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
};
var components = {
  button: {
    borderRadius: borderRadius.xl,
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[3]} ${spacing[4]}`,
      lg: `${spacing[4]} ${spacing[6]}`
    },
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg
    }
  },
  card: {
    borderRadius: borderRadius["2xl"],
    padding: spacing[6],
    shadow: boxShadow.soft
  },
  modal: {
    borderRadius: borderRadius["2xl"],
    shadow: boxShadow.large,
    padding: spacing[6]
  },
  input: {
    borderRadius: borderRadius.lg,
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.base
  }
};
var brand = {
  logo: {
    character: "\u4E2D",
    backgroundColor: colors.mandarin[600],
    color: "#ffffff",
    borderRadius: borderRadius.lg,
    size: {
      sm: spacing[8],
      md: spacing[10],
      lg: spacing[12]
    }
  },
  gradients: {
    primary: "linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%)",
    hero: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    card: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
  }
};

// src/tailwind.config.ts
var mandarinPathTailwindConfig = {
  theme: {
    extend: {
      colors: {
        ...colors,
        // Convenience aliases for most common colors
        primary: colors.mandarin[600],
        "primary-hover": colors.mandarin[700],
        "primary-light": colors.mandarin[50],
        secondary: colors.slate[600],
        "secondary-hover": colors.slate[700],
        muted: colors.slate[500],
        background: colors.slate[50],
        foreground: colors.slate[900],
        border: colors.slate[200],
        "border-muted": colors.slate[100],
        // Semantic aliases
        success: colors.semantic.success,
        warning: colors.semantic.warning,
        error: colors.semantic.error,
        info: colors.semantic.info
      },
      fontFamily: {
        display: [...typography.fontFamily.display],
        body: [...typography.fontFamily.body],
        mono: [...typography.fontFamily.mono]
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
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "scale-in": "scaleIn 0.15s ease-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      },
      // Background gradients as utilities
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #fef2f2 0%, #fed7aa 100%)",
        "gradient-hero": "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        "gradient-card": "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
      }
    }
  },
  plugins: []
};
var tailwind_config_default = mandarinPathTailwindConfig;
function createTailwindConfig(userConfig = {}) {
  const baseConfig = {
    content: [],
    theme: mandarinPathTailwindConfig.theme,
    plugins: mandarinPathTailwindConfig.plugins || []
  };
  return {
    ...baseConfig,
    ...userConfig,
    theme: {
      ...baseConfig.theme,
      ...userConfig.theme,
      extend: {
        ...baseConfig.theme?.extend,
        ...userConfig.theme?.extend
      }
    },
    plugins: [
      ...baseConfig.plugins || [],
      ...userConfig.plugins || []
    ]
  };
}
export {
  createTailwindConfig,
  tailwind_config_default as default,
  mandarinPathTailwindConfig
};
//# sourceMappingURL=tailwind.config.js.map