// Single source of truth for the form's field metadata.
//
// Each entry pairs the form's local key (e.g. `injectionPressure`) with:
//   - i18n label key, tooltip key
//   - validator name (mapped in `validators.js`)
//   - the API payload key (snake_case used by FastAPI/Pydantic)
//
// Splitting the metadata out of the screen file lets us:
//   * iterate sections in JSX without copy-pasting `<FormField .../>` blocks
//   * keep label/tooltip wording in one place
//   * stay in sync between client validation and server schema

export const SECTIONS = [
  {
    id: "injection",
    titleKey: "sectionInjection",
    tipKey: "tipSectionInjection",
    fields: [
      {
        key: "injectionPressure",
        labelKey: "fieldInjectionPressure",
        tipKey: "tipInjectionPressure",
        apiKey: "required_injection_pressure_psi",
        validator: "nonNeg",
      },
      {
        key: "injectionRate",
        labelKey: "fieldInjectionRate",
        tipKey: "tipInjectionRate",
        apiKey: "injection_rate_bwpd",
        validator: "nonNeg",
      },
      {
        key: "reservoirPressure",
        labelKey: "fieldReservoirPressure",
        tipKey: "tipReservoirPressure",
        apiKey: "reservoir_pressure_psi",
        validator: "nonNeg",
      },
      {
        key: "maip",
        labelKey: "fieldMAIP",
        tipKey: "tipMAIP",
        apiKey: "MAIP_psi",
        validator: "nonNeg",
      },
      {
        key: "waterRate",
        labelKey: "fieldWaterRate",
        tipKey: "tipWaterRate",
        apiKey: null, // not part of model payload
        validator: "nonNeg",
      },
      {
        key: "waterCut",
        labelKey: "fieldWaterCut",
        tipKey: "tipWaterCut",
        apiKey: "water_cut_fraction",
        validator: "fraction01",
      },
    ],
  },
  {
    id: "formation",
    titleKey: "sectionFormation",
    tipKey: "tipSectionFormation",
    fields: [
      {
        key: "lithology",
        labelKey: "fieldLithology",
        tipKey: "tipLithology",
        apiKey: "lithology",
        validator: "selectRequired",
        type: "select",
      },
      {
        key: "porosity",
        labelKey: "fieldPorosity",
        tipKey: "tipPorosity",
        apiKey: "porosity_fraction",
        validator: "fraction01",
      },
      {
        key: "permeability",
        labelKey: "fieldPermeability",
        tipKey: "tipPermeability",
        apiKey: "permeability_md",
        validator: "nonNeg",
      },
      {
        key: "grss",
        labelKey: "fieldGRSS",
        tipKey: "tipGRSS",
        apiKey: "GRSS",
        validator: "range0_100",
      },
      {
        key: "temperature",
        labelKey: "fieldTemperature",
        tipKey: "tipTemperature",
        apiKey: "temperature_C",
        validator: "number",
      },
    ],
  },
  {
    id: "chemistry",
    titleKey: "sectionChemistry",
    tipKey: "tipSectionChemistry",
    fields: [
      { key: "tds", labelKey: "fieldTDS", tipKey: "tipTDS", apiKey: "TDS_mg_L", validator: "nonNeg" },
      { key: "tss", labelKey: "fieldTSS", tipKey: "tipTSS", apiKey: "TSS_mg_L", validator: "nonNeg" },
      { key: "oil", labelKey: "fieldOil", tipKey: "tipOil", apiKey: "oil_in_water_ppm", validator: "nonNeg" },
      { key: "ph", labelKey: "fieldPH", tipKey: "tipPH", apiKey: "pH", validator: "range0_14" },
      { key: "ca", labelKey: "fieldCa", tipKey: "tipCa", apiKey: "Ca_mg_L", validator: "nonNeg" },
      { key: "so4", labelKey: "fieldSO4", tipKey: "tipSO4", apiKey: "SO4_mg_L", validator: "nonNeg" },
      { key: "ba", labelKey: "fieldBa", tipKey: "tipBa", apiKey: "Ba_mg_L", validator: "nonNeg" },
      { key: "sr", labelKey: "fieldSr", tipKey: "tipSr", apiKey: "Sr_mg_L", validator: "nonNeg" },
    ],
  },
];

// Flat list of every numeric field key (used to build the initial state map
// and to iterate the validators).
export const NUMERIC_FIELDS = SECTIONS.flatMap((s) =>
  s.fields.filter((f) => f.type !== "select").map((f) => f.key)
);

// Lithology dropdown options — kept in this file so adding a new lithology
// is a single-line change.
export const LITHOLOGY_OPTIONS = [
  { value: "carbonate", labelKey: "lithCarbonate" },
  { value: "sandstone", labelKey: "lithSandstone" },
  { value: "shale", labelKey: "lithShale" },
];
