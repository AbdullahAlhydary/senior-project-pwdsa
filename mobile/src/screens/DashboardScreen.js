import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Card from "../components/Card";
import FormField from "../components/FormField";
import SegmentedSelect from "../components/SegmentedSelect";
import { useI18n } from "../i18n";
import { explain, predict } from "../services/api";
import { DEFAULT_API_URL } from "../services/config";
import { randomSample } from "../services/samples";
import { useTheme } from "../theme";

const TOP_PAD =
  (Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0) + 8;

const NUMERIC_FIELDS = [
  "injectionPressure",
  "injectionRate",
  "maip",
  "waterRate",
  "waterCut",
  "porosity",
  "permeability",
  "grss",
  "temperature",
  "tds",
  "tss",
  "oil",
  "ph",
  "ca",
  "so4",
  "ba",
  "sr",
];

const initialState = Object.fromEntries(NUMERIC_FIELDS.map((k) => [k, ""]));

export default function DashboardScreen() {
  const { t, lang, setLang, isRTL } = useI18n();
  const { colors, mode, toggle: toggleTheme } = useTheme();
  const [values, setValues] = useState(initialState);
  const [lithology, setLithology] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiErr, setApiErr] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analysisErr, setAnalysisErr] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisInputs, setAnalysisInputs] = useState(null);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tmpUrl, setTmpUrl] = useState(apiUrl);
  const lastSampleIdx = useRef(-1);

  const set = (k) => (v) => setValues((s) => ({ ...s, [k]: v }));

  const onAutoFill = useCallback(() => {
    const { values: v, lithology: l, idx } = randomSample(lastSampleIdx.current);
    lastSampleIdx.current = idx;
    setValues(v);
    setLithology(l);
    setErrors({});
    setResult(null);
    setApiErr(null);
  }, []);

  const validators = useMemo(
    () => ({
      injectionPressure: (v) => nonNeg(v, t),
      injectionRate: (v) => nonNeg(v, t),
      maip: (v) => nonNeg(v, t),
      waterRate: (v) => nonNeg(v, t),
      waterCut: (v) => inRange(v, 0, 1, t),
      porosity: (v) => inRange(v, 0, 1, t),
      permeability: (v) => nonNeg(v, t),
      grss: (v) => inRange(v, 0, 100, t),
      temperature: (v) => number(v, t),
      tds: (v) => nonNeg(v, t),
      tss: (v) => nonNeg(v, t),
      oil: (v) => nonNeg(v, t),
      ph: (v) => inRange(v, 0, 14, t),
      ca: (v) => nonNeg(v, t),
      so4: (v) => nonNeg(v, t),
      ba: (v) => nonNeg(v, t),
      sr: (v) => nonNeg(v, t),
    }),
    [t]
  );

  const onSubmit = useCallback(async () => {
    const errs = {};
    for (const k of NUMERIC_FIELDS) {
      const e = validators[k](values[k]);
      if (e) errs[k] = e;
    }
    if (!lithology) errs.lithology = t.errSelect;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // CRI/SRI intentionally omitted — backend substitutes training-set medians.
    const payload = {
      water_cut_fraction: +values.waterCut,
      MAIP_psi: +values.maip,
      required_injection_pressure_psi: +values.injectionPressure,
      porosity_fraction: +values.porosity,
      permeability_md: +values.permeability,
      TDS_mg_L: +values.tds,
      oil_in_water_ppm: +values.oil,
      TSS_mg_L: +values.tss,
      Ca_mg_L: +values.ca,
      SO4_mg_L: +values.so4,
      Ba_mg_L: +values.ba,
      Sr_mg_L: +values.sr,
      lithology,
      pH: +values.ph,
      temperature_C: +values.temperature,
      GRSS: +values.grss,
      language: lang,
    };

    setLoading(true);
    setApiErr(null);
    setResult(null);
    setAnalysis(null);
    setAnalysisErr(null);
    setAnalysisInputs(null);
    try {
      const r = await predict(apiUrl, payload);
      setResult(r);
      // Store the input snapshot so the "Deeper AI Analysis" call uses the
      // exact values that produced the shown result (even if the user edits
      // fields afterward).
      const { language, ...modelInputs } = payload;
      setAnalysisInputs(modelInputs);
    } catch (e) {
      setApiErr(e.message.startsWith("network:") ? t.errCannotReach : e.message);
    } finally {
      setLoading(false);
    }
  }, [values, lithology, validators, apiUrl, lang, t]);

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

  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.content,
          isRTL ? { direction: "rtl" } : null,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t.appTitle}</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={toggleTheme}
              style={styles.iconBtn}
              android_ripple={{ color: colors.inputBorder, borderless: true }}
              hitSlop={8}
            >
              <Text style={styles.iconBtnText}>{mode === "dark" ? "☀" : "☾"}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTmpUrl(apiUrl);
                setSettingsOpen(true);
              }}
              style={styles.iconBtn}
              android_ripple={{ color: colors.inputBorder, borderless: true }}
              hitSlop={8}
            >
              <Text style={styles.iconBtnText}>⚙</Text>
            </Pressable>
            <Pressable
              onPress={toggleLang}
              style={styles.langBtn}
              android_ripple={{ color: colors.inputBorder }}
            >
              <Text style={styles.langBtnText}>
                {lang === "en" ? "العربية" : "English"}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.subtitle}>{t.provideData}</Text>

        <Pressable
          onPress={onAutoFill}
          style={({ pressed }) => [
            styles.autoFillBtn,
            pressed && { backgroundColor: colors.input },
          ]}
          android_ripple={{ color: colors.inputBorder }}
        >
          <Text style={styles.autoFillIcon}>🎲</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.autoFillLabel}>{t.autoFill}</Text>
            <Text style={styles.autoFillHint} numberOfLines={1}>
              {t.autoFillHint}
            </Text>
          </View>
        </Pressable>

        <Card title={t.sectionInjection}>
          <FormField
            label={t.fieldInjectionPressure}
            value={values.injectionPressure}
            onChangeText={set("injectionPressure")}
            error={errors.injectionPressure}
          />
          <FormField
            label={t.fieldInjectionRate}
            value={values.injectionRate}
            onChangeText={set("injectionRate")}
            error={errors.injectionRate}
          />
          <FormField
            label={t.fieldMAIP}
            value={values.maip}
            onChangeText={set("maip")}
            error={errors.maip}
          />
          <FormField
            label={t.fieldWaterRate}
            value={values.waterRate}
            onChangeText={set("waterRate")}
            error={errors.waterRate}
          />
          <FormField
            label={t.fieldWaterCut}
            value={values.waterCut}
            onChangeText={set("waterCut")}
            error={errors.waterCut}
          />
        </Card>

        <Card title={t.sectionFormation}>
          <SegmentedSelect
            label={t.fieldLithology}
            value={lithology}
            onChange={setLithology}
            error={errors.lithology}
            options={[
              { value: "carbonate", label: t.lithCarbonate },
              { value: "sandstone", label: t.lithSandstone },
              { value: "shale", label: t.lithShale },
            ]}
          />
          <FormField
            label={t.fieldPorosity}
            value={values.porosity}
            onChangeText={set("porosity")}
            error={errors.porosity}
          />
          <FormField
            label={t.fieldPermeability}
            value={values.permeability}
            onChangeText={set("permeability")}
            error={errors.permeability}
          />
          <FormField
            label={t.fieldGRSS}
            value={values.grss}
            onChangeText={set("grss")}
            error={errors.grss}
          />
          <FormField
            label={t.fieldTemperature}
            value={values.temperature}
            onChangeText={set("temperature")}
            error={errors.temperature}
          />
        </Card>

        <Card title={t.sectionChemistry}>
          <FormField
            label={t.fieldTDS}
            value={values.tds}
            onChangeText={set("tds")}
            error={errors.tds}
          />
          <FormField
            label={t.fieldTSS}
            value={values.tss}
            onChangeText={set("tss")}
            error={errors.tss}
          />
          <FormField
            label={t.fieldOil}
            value={values.oil}
            onChangeText={set("oil")}
            error={errors.oil}
          />
          <FormField
            label={t.fieldPH}
            value={values.ph}
            onChangeText={set("ph")}
            error={errors.ph}
          />
          <FormField
            label={t.fieldCa}
            value={values.ca}
            onChangeText={set("ca")}
            error={errors.ca}
          />
          <FormField
            label={t.fieldSO4}
            value={values.so4}
            onChangeText={set("so4")}
            error={errors.so4}
          />
          <FormField
            label={t.fieldBa}
            value={values.ba}
            onChangeText={set("ba")}
            error={errors.ba}
          />
          <FormField
            label={t.fieldSr}
            value={values.sr}
            onChangeText={set("sr")}
            error={errors.sr}
          />
        </Card>

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
            t={t}
            colors={colors}
            analysis={analysis}
            analysisErr={analysisErr}
            analysisLoading={analysisLoading}
            onDeeperAnalysis={onDeeperAnalysis}
          />
        ) : null}

        {/* Breathing room so the keyboard can never cover the last field. */}
        <View style={{ height: 220 }} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={settingsOpen}
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBody, { backgroundColor: colors.bgSoft, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t.apiSettings}
            </Text>
            <Text style={[styles.modalHint, { color: colors.textMuted }]}>
              {t.apiSettingsHint}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={tmpUrl}
              onChangeText={setTmpUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholderTextColor={colors.textFaint}
            />
            <View style={styles.modalRow}>
              <Pressable
                onPress={() => {
                  setTmpUrl(apiUrl);
                  setSettingsOpen(false);
                }}
                style={[styles.modalBtnGhost, { borderColor: colors.inputBorder }]}
              >
                <Text style={{ color: colors.textMuted, fontWeight: "600" }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setApiUrl(tmpUrl.trim());
                  setSettingsOpen(false);
                }}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.modalBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function ResultCard({
  result,
  t,
  colors,
  analysis,
  analysisErr,
  analysisLoading,
  onDeeperAnalysis,
}) {
  const entries = Object.entries(result.probabilities).sort(
    (a, b) => b[1] - a[1]
  );
  const showButton = !analysis && !analysisLoading;
  return (
    <Card>
      <Text style={[rs.resultHeader, { color: colors.text }]}>{t.results}</Text>
      <Text style={[rs.resultLine, { color: colors.text }]}>
        {t.recommendedDecision}:{" "}
        <Text style={rs.resultBold}>{result.decision}</Text>
      </Text>
      <Text style={[rs.resultLineMuted, { color: colors.textMuted }]}>
        {t.confidence}: {(result.confidence * 100).toFixed(1)}%
      </Text>
      <Text style={[rs.resultSummary, { color: colors.textMuted }]}>
        {result.summary}
      </Text>

      <View
        style={[
          rs.probsBox,
          { backgroundColor: colors.input, borderColor: colors.inputBorder },
        ]}
      >
        <Text style={[rs.probsTitle, { color: colors.text }]}>
          {t.probabilities}
        </Text>
        {entries.map(([cls, p]) => (
          <View key={cls} style={rs.probRow}>
            <Text
              style={[rs.probLabel, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {cls}
            </Text>
            <View style={[rs.probTrack, { backgroundColor: colors.progressTrack }]}>
              <View
                style={[
                  rs.probFill,
                  {
                    width: `${Math.max(0, Math.min(100, p * 100))}%`,
                    backgroundColor: colors.progressFill,
                  },
                ]}
              />
            </View>
            <Text style={[rs.probValue, { color: colors.textMuted }]}>
              {(p * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 14 }}>
        {showButton ? (
          <Pressable
            onPress={onDeeperAnalysis}
            style={({ pressed }) => [
              rs.aiBtn,
              { backgroundColor: colors.primary },
              pressed && { backgroundColor: colors.primaryPressed },
            ]}
            android_ripple={{ color: "#ffffff22" }}
          >
            <Text style={rs.aiBtnIcon}>🧠</Text>
            <Text style={rs.aiBtnText}>{t.deeperAnalysis}</Text>
          </Pressable>
        ) : null}

        {analysisLoading ? (
          <View
            style={[
              rs.aiPanel,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Text style={[rs.aiPanelTitle, { color: colors.text }]}>
              {t.aiAnalysis}
            </Text>
            <View style={rs.aiLoadingRow}>
              <ActivityIndicator color={colors.text} />
              <Text style={[rs.aiLoadingText, { color: colors.textMuted }]}>
                {t.analyzing}
              </Text>
            </View>
          </View>
        ) : null}

        {analysisErr ? (
          <View
            style={[
              rs.aiPanel,
              {
                backgroundColor: colors.errorSoft,
                borderColor: colors.error,
              },
            ]}
          >
            <Text style={[rs.aiPanelTitle, { color: colors.error }]}>
              {t.aiAnalysis}
            </Text>
            <Text style={[rs.aiPanelBody, { color: colors.text }]}>
              {analysisErr}
            </Text>
            <Pressable
              onPress={onDeeperAnalysis}
              style={({ pressed }) => [
                rs.retryBtn,
                {
                  backgroundColor: pressed
                    ? colors.primaryPressed
                    : colors.primary,
                },
              ]}
              android_ripple={{ color: "#ffffff22" }}
            >
              <Text style={rs.retryBtnText}>{t.retry}</Text>
            </Pressable>
          </View>
        ) : null}

        {analysis ? (
          <View
            style={[
              rs.aiPanel,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <View style={rs.aiPanelHeaderRow}>
              <Text style={[rs.aiPanelTitle, { color: colors.text }]}>
                🧠 {t.aiAnalysis}
              </Text>
              <Text style={[rs.aiBadge, { color: colors.textFaint }]}>
                {analysis.model}
              </Text>
            </View>
            <Text style={[rs.aiPanelBody, { color: colors.text }]}>
              {analysis.analysis}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[rs.modelMeta, { color: colors.textFaint }]}>
        {t.modelInfo}: {result.model_name}
      </Text>
    </Card>
  );
}

function mapLlmError(e, t) {
  switch (e?.code) {
    case "network":
      return t.aiErrorNetwork;
    case "timeout":
      return t.aiErrorTimeout;
    case "auth_error":
      return t.aiErrorAuth;
    case "rate_limited":
      return t.aiErrorQuota;
    case "not_configured":
      return t.aiErrorNotConfigured;
    default:
      return e?.message || t.aiErrorGeneric;
  }
}

function nonNeg(v, t) {
  if (v === "" || v == null) return t.errEmpty;
  const n = Number(v);
  if (Number.isNaN(n)) return t.errNonNumeric;
  if (n < 0) return t.errNegative;
  return null;
}
function inRange(v, lo, hi, t) {
  if (v === "" || v == null) return t.errEmpty;
  const n = Number(v);
  if (Number.isNaN(n)) return t.errNonNumeric;
  if (n < lo || n > hi) return t.errRange(lo, hi);
  return null;
}
function number(v, t) {
  if (v === "" || v == null) return t.errEmpty;
  const n = Number(v);
  if (Number.isNaN(n)) return t.errNonNumeric;
  return null;
}

const makeStyles = (colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingTop: TOP_PAD },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { color: colors.text, fontSize: 22, fontWeight: "800" },
    subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: 16 },
    iconBtn: {
      backgroundColor: colors.input,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBtnText: { color: colors.text, fontSize: 16 },
    langBtn: {
      backgroundColor: colors.input,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    langBtnText: { color: colors.text, fontSize: 13, fontWeight: "600" },
    autoFillBtn: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.inputBorder,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 16,
      gap: 12,
    },
    autoFillIcon: { fontSize: 22 },
    autoFillLabel: { color: colors.text, fontSize: 14, fontWeight: "700" },
    autoFillHint: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
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
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    errTitle: { fontWeight: "700", marginBottom: 4 },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "#000A",
      justifyContent: "flex-end",
    },
    modalBody: {
      padding: 20,
      paddingBottom: 32,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
    modalHint: { fontSize: 12, marginBottom: 14 },
    modalInput: {
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 16,
    },
    modalRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    modalBtn: {
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    modalBtnText: { color: "white", fontWeight: "700" },
    modalBtnGhost: {
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderWidth: 1,
    },
  });

const rs = StyleSheet.create({
  resultHeader: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  resultLine: { fontSize: 15, marginBottom: 4 },
  resultBold: { fontWeight: "700" },
  resultLineMuted: { marginBottom: 8 },
  resultSummary: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  probsBox: { borderRadius: 14, padding: 12, borderWidth: 1 },
  probsTitle: { fontWeight: "700", marginBottom: 8 },
  probRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  probLabel: { width: 130, fontSize: 12 },
  probTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  probFill: { height: "100%" },
  probValue: { width: 50, textAlign: "right", fontSize: 12 },
  modelMeta: { fontSize: 11, marginTop: 8 },

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
  aiPanel: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  aiPanelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  aiPanelTitle: { fontWeight: "700", fontSize: 14, marginBottom: 6 },
  aiPanelBody: { fontSize: 14, lineHeight: 21 },
  aiBadge: { fontSize: 10, fontFamily: "monospace" },
  aiLoadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiLoadingText: { fontSize: 13 },
  retryBtn: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  retryBtnText: { color: "white", fontWeight: "600", fontSize: 13 },
});
