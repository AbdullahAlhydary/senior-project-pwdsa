// Horizontal bar chart of class probabilities.
//
// The classifier returns a `{className -> probability}` dict. We sort by
// descending probability so the recommended decision appears first.

import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

export default function ProbabilityBars({ probabilities }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.input, borderColor: colors.inputBorder },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {t.probabilities}
      </Text>
      {entries.map(([cls, p]) => (
        <View key={cls} style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
            {cls}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.progressTrack }]}>
            <View
              style={[
                styles.fill,
                {
                  // Clamp to [0, 100] in case the server ever sends slightly
                  // out-of-range floats due to FP drift.
                  width: `${Math.max(0, Math.min(100, p * 100))}%`,
                  backgroundColor: colors.progressFill,
                },
              ]}
            />
          </View>
          <Text style={[styles.value, { color: colors.textMuted }]}>
            {(p * 100).toFixed(1)}%
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, padding: 12, borderWidth: 1, marginTop: 4 },
  title: { fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  label: { width: 130, fontSize: 12 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  fill: { height: "100%" },
  value: { width: 50, textAlign: "right", fontSize: 12 },
});
