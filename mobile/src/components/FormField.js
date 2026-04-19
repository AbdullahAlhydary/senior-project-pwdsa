import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme";

export default function FormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = "decimal-pad",
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
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
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  err: { marginTop: 4, fontSize: 12 },
});
