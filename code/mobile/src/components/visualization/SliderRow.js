// Labeled horizontal slider with current value chip.
//
// Wraps the community Slider so the screen file doesn't repeat the same
// label-row + chip layout for every control.

import Slider from "@react-native-community/slider";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme";

export default function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  emphasizeAt,
}) {
  const { colors } = useTheme();
  // `emphasizeAt` lets callers visually flag a critical threshold (e.g. MAIP)
  // by tinting the value chip red when the slider passes it.
  const isCritical =
    typeof emphasizeAt === "number" && value >= emphasizeAt;
  const chipColor = isCritical ? colors.error : colors.primary;
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.chip, { backgroundColor: chipColor }]}>
          {Math.round(value)}
          {unit ? ` ${unit}` : ""}
        </Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.inputBorder}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 6 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 13, fontWeight: "600" },
  chip: {
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
});
