import { createTheme, MantineColorsTuple } from "@mantine/core";

// Custom color palette matching Dark Glassmorphism theme
const slate: MantineColorsTuple = [
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
];

const indigo: MantineColorsTuple = [
  "#eef2ff",
  "#e0e7ff",
  "#c7d2fe",
  "#a5b4fc",
  "#818cf8",
  "#6366f1",
  "#4f46e5",
  "#4338ca",
  "#3730a3",
  "#312e81",
];

export const theme = createTheme({
  // Force dark color scheme
  primaryColor: "indigo",
  primaryShade: { light: 5, dark: 4 },

  colors: {
    slate,
    indigo,
  },

  // Typography
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', Consolas, monospace",

  headings: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontWeight: "600",
  },

  // Border radius
  radius: {
    xs: "0.25rem",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },

  // Shadows matching glassmorphism
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.3)",
    sm: "0 2px 4px rgba(0, 0, 0, 0.35)",
    md: "0 4px 8px rgba(0, 0, 0, 0.4)",
    lg: "0 8px 16px rgba(0, 0, 0, 0.45)",
    xl: "0 16px 32px rgba(0, 0, 0, 0.5)",
  },

  // Default component props
  defaultRadius: "lg",

  // Component overrides
  components: {
    Paper: {
      defaultProps: {
        bg: "rgba(15, 23, 42, 0.5)",
      },
      styles: {
        root: {
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        },
      },
    },

    Button: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    TextInput: {
      styles: {
        input: {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          borderColor: "rgba(51, 65, 85, 0.5)",
          "&:focus": {
            borderColor: "#818cf8",
          },
        },
      },
    },

    PasswordInput: {
      styles: {
        input: {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          borderColor: "rgba(51, 65, 85, 0.5)",
        },
      },
    },

    Select: {
      styles: {
        input: {
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          borderColor: "rgba(51, 65, 85, 0.5)",
        },
        dropdown: {
          backgroundColor: "#0f172a",
          borderColor: "rgba(51, 65, 85, 0.5)",
        },
      },
    },

    Modal: {
      styles: {
        content: {
          backgroundColor: "#0f172a",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        },
        header: {
          backgroundColor: "transparent",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
        },
      },
    },

    Tooltip: {
      styles: {
        tooltip: {
          backgroundColor: "#1e293b",
          color: "#e2e8f0",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        },
      },
    },

    AppShell: {
      styles: {
        main: {
          backgroundColor: "#020617",
        },
        navbar: {
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(51, 65, 85, 0.5)",
        },
        header: {
          backgroundColor: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
        },
      },
    },
  },
});
