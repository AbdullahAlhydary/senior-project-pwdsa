import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";

export default function Card({ title, children, style }) {
  const { colors, mode } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
          shadowOpacity: mode === "light" ? 0.06 : 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 2 },
          elevation: mode === "light" ? 2 : 0,
        },
        style,
      ]}
    >
      {title ? (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
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
    marginBottom: 14,
  },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
});
