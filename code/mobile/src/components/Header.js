// Top app bar — title, theme toggle, settings cog, language switch.
//
// All wiring is delegated to the parent so the header itself stays
// stateless and easy to skin across screens.

import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { useTheme } from "../theme";

const TOP_PAD =
  (Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0) + 8;

export default function Header({ onOpenSettings, onToggleTheme, onToggleLang }) {
  const { t, lang } = useI18n();
  const { colors, mode } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {t.appTitle}
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={onToggleTheme}
          style={[styles.iconBtn, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}
          hitSlop={6}
          android_ripple={{ color: colors.inputBorder, borderless: true }}
          accessibilityLabel="Toggle dark mode"
        >
          <Text style={[styles.iconBtnText, { color: colors.text }]}>
            {mode === "dark" ? "☀" : "☾"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onOpenSettings}
          style={[styles.iconBtn, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}
          hitSlop={6}
          android_ripple={{ color: colors.inputBorder, borderless: true }}
          accessibilityLabel="Backend settings"
        >
          <Text style={[styles.iconBtnText, { color: colors.text }]}>⚙</Text>
        </Pressable>
        <Pressable
          onPress={onToggleLang}
          style={[styles.langBtn, { backgroundColor: colors.input, borderColor: colors.inputBorder }]}
          android_ripple={{ color: colors.inputBorder }}
          accessibilityLabel="Switch language"
        >
          <Text style={[styles.langBtnText, { color: colors.text }]}>
            {lang === "en" ? "العربية" : "English"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const HEADER_TOP_PAD = TOP_PAD;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: "800", flexShrink: 1, marginRight: 8 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    borderWidth: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 16 },
  langBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  langBtnText: { fontSize: 13, fontWeight: "600" },
});
