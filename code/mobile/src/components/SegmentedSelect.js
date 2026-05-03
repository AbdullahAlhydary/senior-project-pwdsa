// Pill-style segmented selector used for the lithology field.
//
// Visually similar to iOS's "segmented control"; built with simple Pressables
// to avoid a third-party dep.

import { Pressable, StyleSheet, Text, View } from "react-native";
import InfoTooltip from "./InfoTooltip";
import { useTheme } from "../theme";

export default function SegmentedSelect({
  label,
  value,
  onChange,
  options,
  error,
  tooltip,
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        {tooltip ? <InfoTooltip title={label} body={tooltip} /> : null}
      </View>
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.error : colors.inputBorder,
          },
        ]}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[
                styles.pill,
                active && { backgroundColor: colors.pillActive },
              ]}
              android_ripple={{ color: colors.inputBorder }}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.textMuted },
                  active && { color: colors.pillActiveText, fontWeight: "700" },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text style={[styles.err, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  label: { fontSize: 13, flexShrink: 1 },
  row: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  pillText: { fontSize: 13, fontWeight: "500" },
  err: { marginTop: 4, fontSize: 12 },
});
