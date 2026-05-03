// Full-screen modal hosting the interactive 2D well-injection simulation.
//
// Workflow position:
//   ResultCard --> "Visualize the Situation" button --> VisualizationModal
//
// The modal seeds its sliders from whatever the user just submitted (so the
// scene reflects the *current* prediction by default) but lets them be
// dragged freely so the user can explore "what if" scenarios — the spec
// asks for fluid simulation between safe and failure states.
//
// Engineering rules enforced visually:
//   * Bubble count tracks `injection_rate_bwpd`.
//   * Fracture count + length tracks (P_inj - MAIP)/MAIP overshoot.
//   * Fluid color darkens slightly with high water cut (more produced water
//     contamination — cosmetic but consistent with industry visuals).
//   * State banner picks Safe / Marginal / Fracture based on margin only.

import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Card from "../Card";
import Legend from "./Legend";
import LithologyPicker from "./LithologyPicker";
import SliderRow from "./SliderRow";
import StateBanner from "./StateBanner";
import WellScene from "./WellScene";
import { useI18n } from "../../i18n";
import { useTheme } from "../../theme";

// Slider domains chosen from the dataset's actual ranges + a comfortable
// extrapolation so users can visualize failure cases.
const RANGES = {
  injectionPressure: { min: 1500, max: 12000, step: 25 },
  reservoirPressure: { min: 1500, max: 6000, step: 25 },
  maip: { min: 4000, max: 9000, step: 25 },
  waterCut: { min: 0, max: 1, step: 0.01 },
  injectionRate: { min: 0, max: 4000, step: 25 },
};

export default function VisualizationModal({
  visible,
  onClose,
  initial,
}) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { width: winW } = useWindowDimensions();

  // Local state for every interactive control. Defaults come from the
  // user's most recent prediction; "Reset" snaps back to those.
  const [injectionPressure, setInjectionPressure] = useState(0);
  const [reservoirPressure, setReservoirPressure] = useState(0);
  const [maip, setMaip] = useState(0);
  const [injectionRate, setInjectionRate] = useState(0);
  const [waterCut, setWaterCut] = useState(0);
  const [lithology, setLithology] = useState("sandstone");

  // Re-seed local state every time the modal opens with fresh inputs.
  useEffect(() => {
    if (!visible || !initial) return;
    setInjectionPressure(initial.injectionPressure ?? 4500);
    setReservoirPressure(initial.reservoirPressure ?? 3500);
    setMaip(initial.maip ?? 7000);
    setInjectionRate(initial.injectionRate ?? 1500);
    setWaterCut(initial.waterCut ?? 0.5);
    setLithology(initial.lithology ?? "sandstone");
  }, [visible, initial]);

  // The scene fits inside the modal's content padding (16 each side + the
  // card's own 16 padding on each side = 64 total).
  const sceneWidth = Math.max(280, Math.min(640, winW - 64));

  // Cosmetic: water cut tints the fluid darker as more produced water
  // is mixed in. Matches the industry's "dirty water" visual cue.
  const fluidColor = useMemo(() => {
    // 0 -> bright cyan, 1 -> muted teal-grey.
    const t = Math.max(0, Math.min(1, waterCut));
    const r = Math.round(91 + (90 - 91) * t);
    const g = Math.round(192 + (130 - 192) * t);
    const b = Math.round(248 + (160 - 248) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }, [waterCut]);

  const onReset = () => {
    if (!initial) return;
    setInjectionPressure(initial.injectionPressure ?? 4500);
    setReservoirPressure(initial.reservoirPressure ?? 3500);
    setMaip(initial.maip ?? 7000);
    setInjectionRate(initial.injectionRate ?? 1500);
    setWaterCut(initial.waterCut ?? 0.5);
    setLithology(initial.lithology ?? "sandstone");
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={[styles.headerBar, { borderColor: colors.cardBorder }]}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {t.visualizationTitle}
          </Text>
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { borderColor: colors.inputBorder, backgroundColor: colors.input }]}
            hitSlop={6}
            accessibilityLabel="Close visualization"
          >
            <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.desc, { color: colors.textMuted }]}>
            {t.visualizationDesc}
          </Text>

          <View style={[styles.sceneWrap, { borderColor: colors.cardBorder }]}>
            <WellScene
              width={sceneWidth}
              injectionPressure={injectionPressure}
              reservoirPressure={reservoirPressure}
              maip={maip}
              flowRate={injectionRate}
              fluidColor={fluidColor}
            />
          </View>

          <Legend />
          <StateBanner injectionPressure={injectionPressure} maip={maip} />
          <FractureMargin
            injectionPressure={injectionPressure}
            maip={maip}
          />

          <Card>
            <SliderRow
              label={`${t.controlInjectionPressure} (psi)`}
              value={injectionPressure}
              min={RANGES.injectionPressure.min}
              max={RANGES.injectionPressure.max}
              step={RANGES.injectionPressure.step}
              unit="psi"
              onChange={setInjectionPressure}
              emphasizeAt={maip}
            />
            <SliderRow
              label={`${t.controlMAIP} (psi)`}
              value={maip}
              min={RANGES.maip.min}
              max={RANGES.maip.max}
              step={RANGES.maip.step}
              unit="psi"
              onChange={setMaip}
            />
            <SliderRow
              label={`${t.controlReservoirPressure} (psi)`}
              value={reservoirPressure}
              min={RANGES.reservoirPressure.min}
              max={RANGES.reservoirPressure.max}
              step={RANGES.reservoirPressure.step}
              unit="psi"
              onChange={setReservoirPressure}
            />
            <SliderRow
              label={`${t.fieldInjectionRate}`}
              value={injectionRate}
              min={RANGES.injectionRate.min}
              max={RANGES.injectionRate.max}
              step={RANGES.injectionRate.step}
              unit="bbl/day"
              onChange={setInjectionRate}
            />
            <SliderRow
              label={t.controlWaterCut}
              value={waterCut}
              min={RANGES.waterCut.min}
              max={RANGES.waterCut.max}
              step={RANGES.waterCut.step}
              onChange={setWaterCut}
            />
            <LithologyPicker value={lithology} onChange={setLithology} />
          </Card>

          <Pressable
            onPress={onReset}
            style={({ pressed }) => [
              styles.resetBtn,
              {
                borderColor: colors.inputBorder,
                backgroundColor: pressed ? colors.input : "transparent",
              },
            ]}
          >
            <Text style={[styles.resetText, { color: colors.text }]}>
              ↺ {t.resetDefaults}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

// Standalone secondary metric — visualizes how far the injection pressure
// is above (or below) the safe ceiling.
function FractureMargin({ injectionPressure, maip }) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const margin = maip > 0 ? (injectionPressure - maip) / maip : 0;
  const pct = Math.round(margin * 100);
  const tone =
    margin >= 0 ? "#DC2626" : margin > -0.05 ? "#D97706" : "#16A34A";
  return (
    <View style={styles.marginRow}>
      <Text style={[styles.marginLabel, { color: colors.textMuted }]}>
        {t.fractureProgress}
      </Text>
      <Text style={[styles.marginValue, { color: tone }]}>
        {pct > 0 ? `+${pct}%` : `${pct}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "800", flexShrink: 1 },
  closeBtn: {
    borderWidth: 1,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { fontSize: 16, fontWeight: "700" },
  content: { padding: 16, paddingBottom: 64 },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  sceneWrap: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    backgroundColor: "#9DD7FB",
  },
  marginRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  marginLabel: { fontSize: 13 },
  marginValue: { fontSize: 14, fontWeight: "800" },
  resetBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetText: { fontWeight: "700", fontSize: 14 },
});
