// Tiny dropdown-styled picker for the simulation modal — reuses the
// SegmentedSelect look but is intentionally a separate component so the
// label phrasing/options can diverge from the form-level lithology field.

import { Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";
import { LITHOLOGY_OPTIONS } from "../../domain/fields";

export default function LithologyPicker({ value, onChange }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t.controlLithology}
      </Text>
      <View
        style={[
          styles.row,
          { backgroundColor: colors.input, borderColor: colors.inputBorder },
        ]}
      >
        {LITHOLOGY_OPTIONS.map((opt) => {
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
                  active && { color: "white", fontWeight: "700" },
                ]}
              >
                {t[opt.labelKey]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 8 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  row: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  pillText: { fontSize: 12, fontWeight: "500" },
});
