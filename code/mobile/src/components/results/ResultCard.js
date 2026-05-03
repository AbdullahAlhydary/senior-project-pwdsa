// Composite "Results" card.
//
// Stitches together every output panel produced by `/api/v1/predict`:
//   1. Header line       — recommended decision + confidence + summary.
//   2. ProbabilityBars   — class likelihood breakdown.
//   3. AlertsCard        — porosity / permeability / injectivity bullets.
//   4. TreatmentCard     — only when decision == "Treat then inject".
//   5. DeeperAnalysisPanel — LLM CTA + visualization button + result.
//
// Each sub-panel is its own file so future tweaks stay localized.

import { StyleSheet, Text, View } from "react-native";
import Card from "../Card";
import ProbabilityBars from "./ProbabilityBars";
import AlertsCard from "./AlertsCard";
import TreatmentCard from "./TreatmentCard";
import DeeperAnalysisPanel from "./DeeperAnalysisPanel";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

export default function ResultCard({
  result,
  analysis,
  analysisErr,
  analysisLoading,
  onDeeperAnalysis,
  onVisualize,
}) {
  const { t } = useI18n();
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={[styles.header, { color: colors.text }]}>{t.results}</Text>
      <Text style={[styles.line, { color: colors.text }]}>
        {t.recommendedDecision}: <Text style={styles.bold}>{result.decision}</Text>
      </Text>
      <Text style={[styles.lineMuted, { color: colors.textMuted }]}>
        {t.confidence}: {(result.confidence * 100).toFixed(1)}%
      </Text>
      <Text style={[styles.summary, { color: colors.textMuted }]}>
        {result.summary}
      </Text>

      <ProbabilityBars probabilities={result.probabilities} />

      {result.alerts?.length ? <AlertsCard alerts={result.alerts} /> : null}

      {result.treatment ? <TreatmentCard treatment={result.treatment} /> : null}

      <DeeperAnalysisPanel
        analysis={analysis}
        loading={analysisLoading}
        error={analysisErr}
        onRequest={onDeeperAnalysis}
        onVisualize={onVisualize}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  line: { fontSize: 15, marginBottom: 4 },
  bold: { fontWeight: "700" },
  lineMuted: { marginBottom: 8 },
  summary: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
});
