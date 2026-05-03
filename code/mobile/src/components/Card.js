// Generic card container — used for every section + result panel.
//
// `tooltip` adds a small "?" badge next to the title for the section-level
// description. Children render below the optional title row.

import { StyleSheet, Text, View } from "react-native";
import InfoTooltip from "./InfoTooltip";
import { useTheme } from "../theme";

export default function Card({ title, tooltip, children, style }) {
  const { colors, mode } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
          // Light mode = subtle shadow, dark mode relies on bg contrast.
          shadowOpacity: mode === "light" ? 0.06 : 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 2 },
          elevation: mode === "light" ? 2 : 0,
        },
        style,
      ]}
    >
      {title ? (
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {tooltip ? <InfoTooltip title={title} body={tooltip} /> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "700" },
});
