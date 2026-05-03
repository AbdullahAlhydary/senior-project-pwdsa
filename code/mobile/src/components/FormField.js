// Single-line numeric/text input row with optional inline tooltip.
//
// `tooltip` (when supplied) renders a small "?" badge next to the label;
// tapping it opens a description modal owned by `InfoTooltip`.

import { StyleSheet, Text, TextInput, View } from "react-native";
import InfoTooltip from "./InfoTooltip";
import { useTheme } from "../theme";

export default function FormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = "decimal-pad",
  tooltip,
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        {tooltip ? <InfoTooltip title={label} body={tooltip} /> : null}
      </View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.error : colors.inputBorder,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {error ? (
        <Text style={[styles.err, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: { fontSize: 13, flexShrink: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  err: { marginTop: 4, fontSize: 12 },
});
