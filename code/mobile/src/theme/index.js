// App-wide theming — dark + light palettes plus a context that swaps them.
//
// The `useTheme` hook returns `{ mode, colors, toggle }`. Components import
// `colors` rather than hard-coding hex values so themes stay consistent.

import { createContext, useContext, useMemo, useState } from "react";

const dark = {
  name: "dark",
  bg: "#050F2C",
  bgSoft: "#0A1F44",
  bgStrong: "#112D4E",
  text: "#FFFFFF",
  textMuted: "#FFFFFFAA",
  textFaint: "#FFFFFF55",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.14)",
  input: "rgba(255,255,255,0.08)",
  inputBorder: "rgba(255,255,255,0.18)",
  primary: "#1E3C72",
  primaryPressed: "#254b8f",
  error: "#FF6B6B",
  errorSoft: "#3A1414",
  progressTrack: "rgba(255,255,255,0.18)",
  progressFill: "#FFFFFF",
  pillActive: "#1E3C72",
  pillActiveText: "#FFFFFF",
  shadow: "#000",
  // Severity tones used by AlertsCard.
  alertSuccess: "#34D399",
  alertWarning: "#FBBF24",
  alertDanger: "#F87171",
};

const light = {
  name: "light",
  bg: "#F4F7FB",
  bgSoft: "#FFFFFF",
  bgStrong: "#EAEEF5",
  text: "#0F172A",
  textMuted: "#47556C",
  textFaint: "#8A95A7",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  input: "#FFFFFF",
  inputBorder: "#D7DEE8",
  primary: "#1E3C72",
  primaryPressed: "#16305d",
  error: "#D92D20",
  errorSoft: "#FEF0EF",
  progressTrack: "#E2E8F0",
  progressFill: "#1E3C72",
  pillActive: "#1E3C72",
  pillActiveText: "#FFFFFF",
  shadow: "#000",
  // Severity tones used by AlertsCard.
  alertSuccess: "#16A34A",
  alertWarning: "#D97706",
  alertDanger: "#DC2626",
};

const THEMES = { dark, light };

const ThemeContext = createContext({
  mode: "dark",
  colors: dark,
  toggle: () => {},
});

export function ThemeProvider({ children, initial = "dark" }) {
  const [mode, setMode] = useState(initial);
  const value = useMemo(
    () => ({
      mode,
      colors: THEMES[mode],
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      setMode,
    }),
    [mode]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
