// Tiny color-swatch legend so users know which color maps to which feature.
import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

const LEGEND = [
  { tk: "legendInjection", color: "#5BC0F8" },
  { tk: "legendAquifer", color: "#3FA0E0" },
  { tk: "legendReservoir", color: "#3F2613" },
  { tk: "legendFracture", color: "#5BC0F8", outlined: true },
];

export default function Legend() {
  const { t } = useI18n();
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {LEGEND.map((item) => (
        <View key={item.tk} style={styles.item}>
          <View
            style={[
              styles.swatch,
              {
                backgroundColor: item.outlined ? "transparent" : item.color,
                borderColor: item.color,
                borderWidth: item.outlined ? 2 : 0,
              },
            ]}
          />
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t[item.tk]}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  item: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  label: { fontSize: 12 },
});
