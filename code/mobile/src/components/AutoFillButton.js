// Dashed "🎲 Auto-fill sample" button. Pulls from `services/samples.js`.
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { useTheme } from "../theme";

export default function AutoFillButton({ onPress }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          borderColor: colors.inputBorder,
          backgroundColor: pressed ? colors.input : "transparent",
        },
      ]}
      android_ripple={{ color: colors.inputBorder }}
      accessibilityLabel={t.autoFill}
    >
      <Text style={styles.icon}>🎲</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.text }]}>{t.autoFill}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]} numberOfLines={1}>
          {t.autoFillHint}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 12,
  },
  icon: { fontSize: 22 },
  label: { fontSize: 14, fontWeight: "700" },
  hint: { fontSize: 11, marginTop: 2 },
});
