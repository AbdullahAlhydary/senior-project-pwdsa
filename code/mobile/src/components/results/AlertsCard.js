// Alerts panel — porosity / permeability / injectivity bullets.
//
// Each bullet renders a colored severity chip + a localized detail line.
// Colors are mapped from the backend severity strings ("low", "good",
// "excellent", "poor", "moderate", "n_a") so the visual encoding matches
// the text without duplicating the rules on the client.

import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

const SEVERITY_TONE = {
  excellent: "success",
  good: "success",
  moderate: "warning",
  low: "warning",
  poor: "danger",
  n_a: "muted",
};

const TONE_TO_COLOR = (colors) => ({
  success: colors.alertSuccess || "#16A34A",
  warning: colors.alertWarning || "#D97706",
  danger: colors.alertDanger || "#DC2626",
  muted: colors.textFaint,
});

const SEVERITY_LABEL_KEY = {
  low: "alertSeverityLow",
  good: "alertSeverityGood",
  excellent: "alertSeverityExcellent",
  poor: "alertSeverityPoor",
  moderate: "alertSeverityModerate",
  n_a: "alertSeverityNa",
};

export default function AlertsCard({ alerts }) {
  const { t, lang } = useI18n();
  const { colors } = useTheme();
  if (!alerts?.length) return null;
  const tones = TONE_TO_COLOR(colors);

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.input, borderColor: colors.inputBorder },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t.alerts}</Text>
      {alerts.map((a) => {
        const tone = SEVERITY_TONE[a.severity] || "muted";
        const dotColor = tones[tone];
        const label = lang === "ar" ? a.label_ar : a.label_en;
        const detail = lang === "ar" ? a.detail_ar : a.detail_en;
        const severityLabel = t[SEVERITY_LABEL_KEY[a.severity]] || "";
        return (
          <View key={a.key} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <View style={{ flex: 1 }}>
              <View style={styles.rowHeader}>
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.severity, { color: dotColor }]}>
                  {severityLabel}
                </Text>
              </View>
              {detail ? (
                <Text style={[styles.detail, { color: colors.textMuted }]}>
                  {detail}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
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
  title: { fontWeight: "700", marginBottom: 10, fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  label: { fontSize: 14, fontWeight: "600" },
  severity: { fontSize: 12, fontWeight: "700" },
  detail: { fontSize: 13, lineHeight: 18 },
});
