/**
 * Representative samples drawn from datasetSP_CSV.csv — stratified across all
 * four `recommended_decision` classes and all three lithologies so the
 * auto-fill button exercises the full decision space.
 */
const SAMPLES = [
  // Disposal — carbonate
  { injectionPressure: 5427, injectionRate: 2432.5, maip: 7122, waterRate: 2619, waterCut: 0.773, lithology: "carbonate", porosity: 0.309, permeability: 201, grss: 64.76, temperature: 74.1, tds: 2289, tss: 116.3, oil: 36.09, ph: 7.98, ca: 1151, so4: 223, ba: 0, sr: 132 },
  // Disposal — sandstone
  { injectionPressure: 5679, injectionRate: 2125, maip: 7126, waterRate: 2250, waterCut: 0.65, lithology: "sandstone", porosity: 0.292, permeability: 730, grss: 66.59, temperature: 52.24, tds: 1698, tss: 199.36, oil: 31.21, ph: 9.59, ca: 1417, so4: 160, ba: 0, sr: 89 },
  // Disposal — shale
  { injectionPressure: 4909, injectionRate: 2567.5, maip: 7476, waterRate: 2781, waterCut: 0.827, lithology: "shale", porosity: 0.282, permeability: 712, grss: 62.29, temperature: 33.22, tds: 2472, tss: 191.27, oil: 9.85, ph: 8.01, ca: 1488, so4: 224, ba: 0, sr: 93 },
  // Inject — carbonate
  { injectionPressure: 4403, injectionRate: 1250, maip: 6800, waterRate: 1200, waterCut: 0.3, lithology: "carbonate", porosity: 0.268, permeability: 599, grss: 84.15, temperature: 45.39, tds: 3035, tss: 49.06, oil: 8.55, ph: 7.94, ca: 1163, so4: 151, ba: 0, sr: 103 },
  // Inject — sandstone
  { injectionPressure: 4718, injectionRate: 2115, maip: 7569, waterRate: 2238, waterCut: 0.646, lithology: "sandstone", porosity: 0.298, permeability: 755, grss: 88.53, temperature: 45.06, tds: 3722, tss: 36.52, oil: 7.78, ph: 7.94, ca: 1110, so4: 259, ba: 0, sr: 87 },
  // Injection not suitable — carbonate
  { injectionPressure: 8790, injectionRate: 2422.5, maip: 7590, waterRate: 2607, waterCut: 0.769, lithology: "carbonate", porosity: 0.275, permeability: 749, grss: 35.3, temperature: 62.65, tds: 3280, tss: 259.23, oil: 8.36, ph: 7.88, ca: 1932, so4: 228, ba: 0, sr: 144 },
  // Injection not suitable — sandstone
  { injectionPressure: 7054, injectionRate: 2442.5, maip: 6854, waterRate: 2631, waterCut: 0.777, lithology: "sandstone", porosity: 0.269, permeability: 716, grss: 59.74, temperature: 42.56, tds: 1290, tss: 144.66, oil: 6.84, ph: 7.45, ca: 1448, so4: 274, ba: 0, sr: 157 },
  // Injection not suitable — shale
  { injectionPressure: 5062, injectionRate: 2412.5, maip: 7388, waterRate: 2595, waterCut: 0.765, lithology: "shale", porosity: 0.248, permeability: 520, grss: 49.44, temperature: 35.92, tds: 1571, tss: 100.79, oil: 9.33, ph: 8.07, ca: 835, so4: 185, ba: 0, sr: 84 },
  // Treat then inject — carbonate
  { injectionPressure: 3698, injectionRate: 1560, maip: 7104, waterRate: 1572, waterCut: 0.424, lithology: "carbonate", porosity: 0.286, permeability: 631, grss: 78.61, temperature: 51.85, tds: 2747, tss: 51.29, oil: 8.74, ph: 7.97, ca: 1902, so4: 40, ba: 0, sr: 164 },
  // Treat then inject — sandstone
  { injectionPressure: 4494, injectionRate: 1725, maip: 7314, waterRate: 1770, waterCut: 0.49, lithology: "sandstone", porosity: 0.264, permeability: 649, grss: 75.61, temperature: 50.02, tds: 1118, tss: 20.9, oil: 8.85, ph: 7.73, ca: 1518, so4: 99, ba: 0, sr: 104 },
  // Treat then inject — shale
  { injectionPressure: 4334, injectionRate: 1872.5, maip: 7488, waterRate: 1947, waterCut: 0.549, lithology: "shale", porosity: 0.28, permeability: 212, grss: 73.26, temperature: 37.31, tds: 2146, tss: 163.71, oil: 24.54, ph: 8.25, ca: 1268, so4: 187, ba: 0, sr: 115 },
];

const KEYS = [
  "injectionPressure", "injectionRate", "maip", "waterRate", "waterCut",
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
