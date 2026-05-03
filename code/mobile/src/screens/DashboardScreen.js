// Dashboard screen — composes every other UI piece.
//
// Responsibilities:
//   * Hold the form values + derived prediction state.
//   * Validate inputs locally (server validates again).
//   * Talk to the FastAPI backend via `services/api.js`.
//   * Wire up the visualization modal and "Deeper AI Analysis" panel.
//
// All field rendering, alerts, treatment, results, visualization etc. are
// extracted into small components under `components/` so this file stays a
// thin orchestrator (compare with the previous 800-line version).

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ApiSettingsModal from "../components/ApiSettingsModal";
import AutoFillButton from "../components/AutoFillButton";
import Card from "../components/Card";
import FormSection from "../components/FormSection";
import Header, { HEADER_TOP_PAD } from "../components/Header";
import ResultCard from "../components/results/ResultCard";
import VisualizationModal from "../components/visualization/VisualizationModal";

import { NUMERIC_FIELDS, SECTIONS } from "../domain/fields";
import { buildPredictPayload, snapshotInputs } from "../domain/payload";
import { VALIDATORS } from "../domain/validators";
import { useI18n } from "../i18n";
import { buildAlerts } from "../services/alerts";
import { explain, predict } from "../services/api";
import { buildTreatment } from "../services/che_treatment";
import { DEFAULT_API_URL } from "../services/config";
import { randomSample } from "../services/samples";
import { useTheme } from "../theme";

// Decision label that triggers the chemical-treatment recommendation.
const TREAT_DECISION = "Treat then inject";

/**
 * Merge backend response with client-side fallbacks for `alerts` and
 * `treatment`. The server is authoritative when it returns data, but we
 * always compute locally as well so the UI works even if a stale backend
 * is running and skipped these fields entirely.
 */
function enrichResult(result, payload) {
  const next = { ...result };
  if (!Array.isArray(next.alerts) || next.alerts.length === 0) {
    next.alerts = buildAlerts(payload);
  }
  if (!next.treatment && next.decision === TREAT_DECISION) {
    next.treatment = buildTreatment(payload);
  }
  return next;
}

// Flat map of field-key -> validator-fn so the submit handler doesn't have
// to walk the SECTIONS tree every call.
const FIELD_VALIDATOR = (() => {
  const out = {};
  for (const s of SECTIONS) {
    for (const f of s.fields) {
      out[f.key] = VALIDATORS[f.validator];
    }
  }
  return out;
})();

const initialState = Object.fromEntries(NUMERIC_FIELDS.map((k) => [k, ""]));

export default function DashboardScreen() {
  const { t, lang, setLang, isRTL } = useI18n();
  const { colors, toggle: toggleTheme } = useTheme();

  // Form state
  const [values, setValues] = useState(initialState);
  const [lithology, setLithology] = useState(null);
  const [errors, setErrors] = useState({});

  // Prediction state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiErr, setApiErr] = useState(null);

  // LLM analysis state
  const [analysis, setAnalysis] = useState(null);
  const [analysisErr, setAnalysisErr] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisInputs, setAnalysisInputs] = useState(null);

  // Modals + persistent settings
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [vizOpen, setVizOpen] = useState(false);
  const lastSampleIdx = useRef(-1);

  const setValue = useCallback(
    (k) => (v) => setValues((s) => ({ ...s, [k]: v })),
    []
  );

  const onAutoFill = useCallback(() => {
    const { values: v, lithology: l, idx } = randomSample(lastSampleIdx.current);
    lastSampleIdx.current = idx;
    setValues(v);
    setLithology(l);
    setErrors({});
    setResult(null);
    setApiErr(null);
  }, []);

  const onSubmit = useCallback(async () => {
    // Run every validator and gather error messages.
    const errs = {};
    for (const k of NUMERIC_FIELDS) {
      const v = FIELD_VALIDATOR[k]?.(values[k], t);
      if (v) errs[k] = v;
    }
    if (!lithology) errs.lithology = t.errSelect;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = buildPredictPayload(values, lithology, lang);

    setLoading(true);
    setApiErr(null);
    setResult(null);
    setAnalysis(null);
    setAnalysisErr(null);
    setAnalysisInputs(null);
    try {
      const r = await predict(apiUrl, payload);
      // `enrichResult` fills in alerts + treatment client-side when the
      // backend response is missing them (e.g. the user is connected to a
      // backend that hasn't been restarted with the latest code).
      setResult(enrichResult(r, payload));
      // Snapshot the exact inputs that produced this result so a later
      // "Deeper AI Analysis" call uses them even if the user edits the form.
      setAnalysisInputs(snapshotInputs(payload));
    } catch (e) {
      setApiErr(e.message.startsWith("network:") ? t.errCannotReach : e.message);
    } finally {
      setLoading(false);
    }
  }, [values, lithology, apiUrl, lang, t]);

  const onDeeperAnalysis = useCallback(async () => {
    if (!result || !analysisInputs) return;
    setAnalysisLoading(true);
    setAnalysisErr(null);
    setAnalysis(null);
    try {
      const r = await explain(apiUrl, {
        inputs: analysisInputs,
        decision: result.decision,
        confidence: result.confidence,
        probabilities: result.probabilities,
        classifier_summary: result.summary,
        language: lang,
      });
      setAnalysis(r);
    } catch (e) {
      setAnalysisErr(mapLlmError(e, t));
    } finally {
      setAnalysisLoading(false);
    }
  }, [apiUrl, result, analysisInputs, lang, t]);

  // Build the seed object the visualization modal opens with.
  const visualizationSeed = useMemo(() => {
    const num = (k) => (values[k] === "" || values[k] == null ? null : Number(values[k]));
    return {
      injectionPressure: num("injectionPressure") ?? 4500,
      reservoirPressure: num("reservoirPressure") ?? 3500,
      maip: num("maip") ?? 7000,
      injectionRate: num("injectionRate") ?? 1500,
      waterCut: num("waterCut") ?? 0.5,
      lithology: lithology ?? "sandstone",
    };
  }, [values, lithology]);

  const onToggleLang = () => setLang(lang === "en" ? "ar" : "en");

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, isRTL ? { direction: "rtl" } : null]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleTheme={toggleTheme}
          onToggleLang={onToggleLang}
        />
        <Text style={styles.subtitle}>{t.provideData}</Text>

        <AutoFillButton onPress={onAutoFill} />

        {SECTIONS.map((section) => (
          <FormSection
            key={section.id}
            section={section}
            values={values}
            onChangeValue={setValue}
            errors={errors}
            lithology={lithology}
            onChangeLithology={setLithology}
          />
        ))}

        <Pressable
          onPress={loading ? undefined : onSubmit}
          style={({ pressed }) => [
            styles.button,
            loading && styles.buttonDisabled,
            pressed && { backgroundColor: colors.primaryPressed },
          ]}
          android_ripple={{ color: "#ffffff22" }}
        >
          {loading ? (
            <View style={styles.row}>
              <ActivityIndicator color="white" />
              <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                {t.predicting}
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>{t.showResults}</Text>
          )}
        </Pressable>

        {apiErr ? (
          <Card style={{ borderColor: colors.error, backgroundColor: colors.errorSoft }}>
            <Text style={[styles.errTitle, { color: colors.error }]}>
              {t.predictionFailed}
            </Text>
            <Text style={{ color: colors.text }}>{apiErr}</Text>
          </Card>
        ) : null}

        {result ? (
          <ResultCard
            result={result}
            analysis={analysis}
            analysisErr={analysisErr}
            analysisLoading={analysisLoading}
            onDeeperAnalysis={onDeeperAnalysis}
            onVisualize={() => setVizOpen(true)}
          />
        ) : null}

        {/* Padding so the keyboard never hides the last input. */}
        <View style={{ height: 220 }} />
      </ScrollView>

      <ApiSettingsModal
        visible={settingsOpen}
        initialUrl={apiUrl}
        onClose={() => setSettingsOpen(false)}
        onSave={(u) => {
          setApiUrl(u);
          setSettingsOpen(false);
        }}
      />

      <VisualizationModal
        visible={vizOpen}
        onClose={() => setVizOpen(false)}
        initial={visualizationSeed}
      />
    </KeyboardAvoidingView>
  );
}

// Translates the LLM service's structured error code into a localized
// message. Done here (rather than in the panel component) so the screen's
// i18n catalog stays the single source for user-facing strings.
function mapLlmError(e, t) {
  switch (e?.code) {
    case "network": return t.aiErrorNetwork;
    case "timeout": return t.aiErrorTimeout;
    case "auth_error": return t.aiErrorAuth;
    case "rate_limited": return t.aiErrorQuota;
    case "not_configured": return t.aiErrorNotConfigured;
    default: return e?.message || t.aiErrorGeneric;
  }
}

const makeStyles = (colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingTop: HEADER_TOP_PAD },
    subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: 16 },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
      marginTop: 6,
      marginBottom: 12,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    errTitle: { fontWeight: "700", marginBottom: 4 },
  });
