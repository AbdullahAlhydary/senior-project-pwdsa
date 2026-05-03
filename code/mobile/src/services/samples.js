// Representative samples drawn from `data/dataset.csv` — stratified across
// all four `recommended_decision` classes and all three lithologies so the
// auto-fill button exercises the full decision space.
//
// Each sample now also carries the `reservoirPressure` and an
// `injectionRate` so the new alerts and visualization controls have
// realistic defaults.
const SAMPLES = [
  // Treat then inject — carbonate
  { injectionPressure: 4461, injectionRate: 1820, reservoirPressure: 3932, maip: 7113, waterRate: 1620, waterCut: 0.583, lithology: "carbonate", porosity: 0.279, permeability: 610, grss: 72.82, temperature: 40.44, tds: 2607, tss: 67.03, oil: 7.06, ph: 7.97, ca: 999, so4: 245, ba: 0, sr: 162 },
  // Treat then inject — sandstone
  { injectionPressure: 4141, injectionRate: 1860, reservoirPressure: 4091, maip: 7172, waterRate: 1700, waterCut: 0.525, lithology: "sandstone", porosity: 0.291, permeability: 792, grss: 77.75, temperature: 47.27, tds: 2430, tss: 97.9, oil: 6.05, ph: 7.9, ca: 1113, so4: 236, ba: 0, sr: 146 },
  // Treat then inject — shale
  { injectionPressure: 4422, injectionRate: 1645, reservoirPressure: 4372, maip: 6937, waterRate: 1480, waterCut: 0.413, lithology: "shale", porosity: 0.287, permeability: 225, grss: 75.7, temperature: 50.39, tds: 3478, tss: 33.52, oil: 12.54, ph: 7.9, ca: 1220, so4: 195, ba: 0, sr: 98 },
  // Inject — carbonate
  { injectionPressure: 4370, injectionRate: 1280, reservoirPressure: 4320, maip: 7780, waterRate: 1180, waterCut: 0.514, lithology: "carbonate", porosity: 0.28, permeability: 723, grss: 84.42, temperature: 32.72, tds: 1623, tss: 102.68, oil: 8.31, ph: 8.08, ca: 1308, so4: 119, ba: 0, sr: 154 },
  // Inject — sandstone
  { injectionPressure: 4710, injectionRate: 2160, reservoirPressure: 4351, maip: 7080, waterRate: 1980, waterCut: 0.663, lithology: "sandstone", porosity: 0.276, permeability: 596, grss: 95.0, temperature: 55.33, tds: 3179, tss: 31.48, oil: 7.12, ph: 8.2, ca: 996, so4: 195, ba: 0, sr: 119 },
  // Injection not suitable — carbonate
  { injectionPressure: 7275, injectionRate: 2310, reservoirPressure: 3033, maip: 7075, waterRate: 2100, waterCut: 0.735, lithology: "carbonate", porosity: 0.277, permeability: 645, grss: 59.73, temperature: 38.0, tds: 246, tss: 119.36, oil: 11.29, ph: 8.23, ca: 1477, so4: 345, ba: 0, sr: 103 },
  // Injection not suitable — sandstone
  { injectionPressure: 8463, injectionRate: 2480, reservoirPressure: 3097, maip: 7263, waterRate: 2200, waterCut: 0.789, lithology: "sandstone", porosity: 0.274, permeability: 660, grss: 34.42, temperature: 46.28, tds: 2844, tss: 336.45, oil: 24.3, ph: 8.0, ca: 1114, so4: 325, ba: 0, sr: 158 },
  // Injection not suitable — shale
  { injectionPressure: 4147, injectionRate: 1950, reservoirPressure: 3839, maip: 7312, waterRate: 1820, waterCut: 0.647, lithology: "shale", porosity: 0.265, permeability: 492, grss: 32.0, temperature: 53.12, tds: 4164, tss: 105.79, oil: 9.38, ph: 8.18, ca: 973, so4: 204, ba: 0, sr: 169 },
  // Disposal — carbonate
  { injectionPressure: 6007, injectionRate: 2380, reservoirPressure: 3145, maip: 6890, waterRate: 2150, waterCut: 0.77, lithology: "carbonate", porosity: 0.273, permeability: 516, grss: 73.26, temperature: 51.1, tds: 2421, tss: 90.6, oil: 22.79, ph: 7.92, ca: 1412, so4: 152, ba: 0, sr: 149 },
  // Disposal — sandstone
  { injectionPressure: 5503, injectionRate: 2410, reservoirPressure: 3212, maip: 7161, waterRate: 2200, waterCut: 0.772, lithology: "sandstone", porosity: 0.291, permeability: 883, grss: 73.58, temperature: 35.75, tds: 1477, tss: 172.09, oil: 10.9, ph: 7.89, ca: 1679, so4: 263, ba: 0, sr: 96 },
  // Disposal — shale
  { injectionPressure: 5079, injectionRate: 2360, reservoirPressure: 3221, maip: 7210, waterRate: 2150, waterCut: 0.743, lithology: "shale", porosity: 0.261, permeability: 614, grss: 69.18, temperature: 33.04, tds: 3034, tss: 37.47, oil: 11.61, ph: 8.2, ca: 1332, so4: 136, ba: 0, sr: 117 },
];

// All numeric form keys (lithology is handled separately because it's a
// pill-segmented selector, not a TextInput).
const KEYS = [
  "injectionPressure", "injectionRate", "reservoirPressure", "maip", "waterRate", "waterCut",
  "porosity", "permeability", "grss", "temperature",
  "tds", "tss", "oil", "ph", "ca", "so4", "ba", "sr",
];

/**
 * Returns a random sample split into:
 *   - `values`: numeric string map to drop into the form's TextInputs
 *   - `lithology`: the categorical selection
 * Avoids repeating the last sample so consecutive clicks give variety.
 */
export function randomSample(previousIdx = -1) {
  let idx = Math.floor(Math.random() * SAMPLES.length);
  if (SAMPLES.length > 1 && idx === previousIdx) {
    idx = (idx + 1) % SAMPLES.length;
  }
  const s = SAMPLES[idx];
  const values = Object.fromEntries(KEYS.map((k) => [k, String(s[k])]));
  return { values, lithology: s.lithology, idx };
}

export const SAMPLE_COUNT = SAMPLES.length;
