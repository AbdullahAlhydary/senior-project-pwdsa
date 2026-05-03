// Color-coded one-line banner that summarizes the current scenario state:
//   * Safe injection                  (margin <= -0.05)
//   * Approaching fracture pressure   (-0.05 < margin < 0)
//   * Reservoir fracturing — STOP     (margin >= 0)
//
// The thresholds match `WellScene`'s fracture rendering so the banner
// always reflects what the picture shows.

import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

export function classifyState(injectionPressure, maip) {
  if (maip <= 0) return "safe";
  const margin = (injectionPressure - maip) / maip;
  if (margin >= 0) return "fracture";
  if (margin > -0.05) return "marginal";
  return "safe";
}

const STATE_TEXT = {
  safe: "stateSafe",
  marginal: "stateMarginal",
  fracture: "stateFracture",
};

const STATE_COLOR = {
  safe: "#16A34A",
  marginal: "#D97706",
  fracture: "#DC2626",
};

export default function StateBanner({ injectionPressure, maip }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const state = classifyState(injectionPressure, maip);
  const bg = STATE_COLOR[state];

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Text style={styles.text}>{t[STATE_TEXT[state]]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 10,
  },
  text: { color: "white", fontWeight: "700", textAlign: "center" },
});
