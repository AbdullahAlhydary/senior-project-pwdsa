import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";

export default function SegmentedSelect({ label, value, onChange, options, error }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
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
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 6 },
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
