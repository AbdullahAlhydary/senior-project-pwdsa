// Bottom-sheet modal for editing the backend URL at runtime.
//
// Extracted out of DashboardScreen to keep that file focused on the form
// + result orchestration.

import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useI18n } from "../i18n";
import { useTheme } from "../theme";

export default function ApiSettingsModal({
  visible,
  initialUrl,
  onClose,
  onSave,
}) {
  const { t } = useI18n();
  const { colors } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.body,
            { backgroundColor: colors.bgSoft, borderColor: colors.cardBorder },
          ]}
        >
          <UrlEditor
            initialUrl={initialUrl}
            onClose={onClose}
            onSave={onSave}
            t={t}
            colors={colors}
          />
        </View>
      </View>
    </Modal>
  );
}

// Small inner component so the TextInput state lives close to its caller.
import { useState, useEffect } from "react";

function UrlEditor({ initialUrl, onClose, onSave, t, colors }) {
  const [tmp, setTmp] = useState(initialUrl);
  // Reset the staged URL whenever the modal reopens with a fresh prop.
  useEffect(() => setTmp(initialUrl), [initialUrl]);

  return (
    <>
      <Text style={[styles.title, { color: colors.text }]}>{t.apiSettings}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {t.apiSettingsHint}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.inputBorder,
            color: colors.text,
          },
        ]}
        value={tmp}
        onChangeText={setTmp}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholderTextColor={colors.textFaint}
      />
      <View style={styles.row}>
        <Pressable
          onPress={onClose}
          style={[styles.btnGhost, { borderColor: colors.inputBorder }]}
        >
          <Text style={{ color: colors.textMuted, fontWeight: "600" }}>
            {t.cancel}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onSave(tmp.trim())}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.btnText}>{t.save}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000A", justifyContent: "flex-end" },
  body: {
    padding: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  hint: { fontSize: 12, marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  btn: { borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  btnText: { color: "white", fontWeight: "700" },
  btnGhost: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
  },
});
