// Translates the form's local-key state into the API payload.
//
// The mapping is driven entirely by `fields.SECTIONS[*].fields[*].apiKey`
// so adding or renaming a backend field only requires editing `fields.js`.

import { SECTIONS } from "./fields";

/**
 * Build the JSON body for `POST /api/v1/predict`.
 *
 * @param {object} values     - form key -> string text
 * @param {string|null} lithology
 * @param {"en"|"ar"} language
 * @returns {object} API payload (server enforces validation again)
 */
export function buildPredictPayload(values, lithology, language) {
  const out = { language };
  for (const section of SECTIONS) {
    for (const f of section.fields) {
      if (!f.apiKey) continue;
      if (f.key === "lithology") {
        out[f.apiKey] = lithology;
        continue;
      }
      const raw = values[f.key];
      // Empty -> null so the server falls back to defaults instead of NaN.
      out[f.apiKey] = raw === "" || raw == null ? null : Number(raw);
    }
  }
  return out;
}

/**
 * Strip the language hint and produce the snapshot kept around for the
 * "Deeper AI Analysis" call (so user edits to the form afterwards don't
 * mutate the snapshot the LLM reasoning is based on).
 */
export function snapshotInputs(payload) {
  const { language: _language, ...rest } = payload;
  return rest;
}
