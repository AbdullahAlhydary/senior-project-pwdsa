// Question-mark "?" icon that opens a small modal explaining a field.
//
// Tooltips are decoupled from the field components themselves so any label
// (section title, individual input, control panel) can attach an explanation
// without re-implementing the modal logic.

import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";
import { useI18n } from "../i18n";

export default function InfoTooltip({ title, body }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        // hitSlop expands the tap target without enlarging the visual icon.
        hitSlop={8}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={title || "Help"}
        style={({ pressed }) => [
          styles.icon,
          {
            borderColor: colors.inputBorder,
            backgroundColor: pressed ? colors.input : "transparent",
          },
        ]}
      >
        <Text style={[styles.iconText, { color: colors.textMuted }]}>?</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Dismiss tooltip"
        >
          <View
            // `onStartShouldSetResponder` blocks the backdrop's onPress when
            // the user taps inside the card itself.
            onStartShouldSetResponder={() => true}
            style={[
              styles.body,
              { backgroundColor: colors.bgSoft, borderColor: colors.cardBorder },
            ]}
          >
            {title ? (
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            ) : null}
            <Text style={[styles.text, { color: colors.textMuted }]}>{body}</Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => setOpen(false)}
                style={[styles.btn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.btnText}>{t.close}</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  iconText: { fontSize: 12, fontWeight: "700", lineHeight: 14 },
  backdrop: {
    flex: 1,
    backgroundColor: "#000A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  body: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    width: "100%",
    maxWidth: 420,
  },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 21 },
  row: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  btn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "700" },
});
