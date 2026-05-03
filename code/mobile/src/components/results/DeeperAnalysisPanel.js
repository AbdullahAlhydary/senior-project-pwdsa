// LLM analysis section — initial CTA, loading state, error retry, success.
//
// The parent owns the analysis state; this component is a pure renderer
// that picks the right sub-view based on the props.

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

export default function DeeperAnalysisPanel({
  analysis,
  loading,
  error,
  onRequest,
  onVisualize,
  visualizeLabel,
}) {
  const { t } = useI18n();
  const { colors } = useTheme();

  // Pick the view-state. We render either: CTA, loader, error, or result.
  // The "Visualize the situation" button is always available alongside the
  // CTA so users can play with the simulation without spending an LLM call.
  const showInitial = !analysis && !loading && !error;

  return (
    <View style={{ marginTop: 16, gap: 10 }}>
      {showInitial ? (
        <Pressable
          onPress={onRequest}
          style={({ pressed }) => [
            styles.aiBtn,
            { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
          ]}
          android_ripple={{ color: "#ffffff22" }}
        >
          <Text style={styles.aiBtnIcon}>🧠</Text>
          <Text style={styles.aiBtnText}>{t.deeperAnalysis}</Text>
        </Pressable>
      ) : null}

      {/* "Visualize the situation" button is always rendered so users can
          launch the simulation without first running the LLM. */}
      <Pressable
        onPress={onVisualize}
        style={({ pressed }) => [
          styles.visBtn,
          {
            borderColor: colors.inputBorder,
            backgroundColor: pressed ? colors.input : "transparent",
          },
        ]}
        android_ripple={{ color: colors.inputBorder }}
      >
        <Text style={[styles.visText, { color: colors.text }]}>
          {visualizeLabel || t.visualizeBtn}
        </Text>
      </Pressable>

      {loading ? (
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.input, borderColor: colors.inputBorder },
          ]}
        >
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            {t.aiAnalysis}
          </Text>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.text} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              {t.analyzing}
            </Text>
          </View>
        </View>
      ) : null}

      {error ? (
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.errorSoft, borderColor: colors.error },
          ]}
        >
          <Text style={[styles.panelTitle, { color: colors.error }]}>
            {t.aiAnalysis}
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>{error}</Text>
          <Pressable
            onPress={onRequest}
            style={({ pressed }) => [
              styles.retryBtn,
              {
                backgroundColor: pressed
                  ? colors.primaryPressed
                  : colors.primary,
              },
            ]}
            android_ripple={{ color: "#ffffff22" }}
          >
            <Text style={styles.retryBtnText}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : null}

      {analysis ? (
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.input, borderColor: colors.inputBorder },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              🧠 {t.aiAnalysis}
            </Text>
            <Text style={[styles.badge, { color: colors.textFaint }]}>
              {analysis.model}
            </Text>
          </View>
          <Text style={[styles.body, { color: colors.text }]}>
            {analysis.analysis}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  aiBtnIcon: { fontSize: 16 },
  aiBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
  visBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  visText: { fontWeight: "700", fontSize: 14 },
  panel: { borderWidth: 1, borderRadius: 14, padding: 14 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  panelTitle: { fontWeight: "700", fontSize: 14, marginBottom: 6 },
  badge: { fontSize: 10, fontFamily: "monospace" },
  body: { fontSize: 14, lineHeight: 21 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingText: { fontSize: 13 },
  retryBtn: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  retryBtnText: { color: "white", fontWeight: "600", fontSize: 13 },
});
