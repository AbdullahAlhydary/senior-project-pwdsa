// "Treat then inject" recommendation panel.
//
// Shown only when the API response contains a `treatment` block (i.e. the
// classifier picked the "Treat then inject" class). Tapping the PubChem
// hazard button opens the safety sheet for the recommended substance in
// the device's browser.

import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

export default function TreatmentCard({ treatment }) {
  const { t, lang } = useI18n();
  const { colors } = useTheme();
  if (!treatment) return null;

  const contributorLabel =
    lang === "ar" ? treatment.contributor_label_ar : treatment.contributor_label_en;
  const whenToUse =
    lang === "ar" ? treatment.when_to_use_ar : treatment.when_to_use_en;

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: colors.input,
          borderColor: colors.inputBorder,
        },
      ]}
    >
      <View style={[styles.headerRow, { borderColor: colors.cardBorder }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          🧪 {t.treatmentTitle}
        </Text>
      </View>

      <Row label={t.treatmentContributor} value={contributorLabel} colors={colors} />
      <Row label={t.treatmentSubstance} value={treatment.substance} colors={colors} />
      <Row label={t.treatmentWhen} value={whenToUse} colors={colors} multiline />

      <Pressable
        onPress={() => Linking.openURL(treatment.pubchem_url)}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          },
        ]}
        android_ripple={{ color: "#ffffff22" }}
        accessibilityLabel={t.treatmentPubchem}
      >
        <Text style={styles.btnText}>🔗 {t.treatmentPubchem}</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value, colors, multiline }) {
  return (
    <View style={[styles.row, multiline && styles.rowMultiline]}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          { color: colors.text },
          multiline ? styles.rowValueMulti : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  headerRow: {
    paddingBottom: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  title: { fontWeight: "700", fontSize: 14 },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  rowMultiline: { flexDirection: "column", alignItems: "stretch" },
  rowLabel: { fontSize: 12, width: 130, fontWeight: "600" },
  rowValue: { flex: 1, fontSize: 14, lineHeight: 20 },
  rowValueMulti: { marginTop: 4 },
  btn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 14 },
});
