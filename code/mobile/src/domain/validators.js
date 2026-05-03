// Lightweight, i18n-aware validators used by the dashboard form.
//
// Each validator accepts the raw text from the TextInput and the i18n
// translation table. Returning `null` means "no error"; returning a string
// means "this is the error message to render in the UI".

const numeric = (v, t) => {
  if (v === "" || v == null) return t.errEmpty;
  const n = Number(v);
  if (Number.isNaN(n)) return t.errNonNumeric;
  return n;
};

export const number = (v, t) => {
  const r = numeric(v, t);
  return typeof r === "string" ? r : null;
};

export const nonNeg = (v, t) => {
  const r = numeric(v, t);
  if (typeof r === "string") return r;
  if (r < 0) return t.errNegative;
  return null;
};

export const inRange = (lo, hi) => (v, t) => {
  const r = numeric(v, t);
  if (typeof r === "string") return r;
  if (r < lo || r > hi) return t.errRange(lo, hi);
  return null;
};

export const fraction01 = inRange(0, 1);
export const range0_14 = inRange(0, 14);
export const range0_100 = inRange(0, 100);

export const selectRequired = (v, t) => (v ? null : t.errSelect);

// Map matching `field.validator` strings in `fields.js` to the actual fn.
export const VALIDATORS = {
  number,
  nonNeg,
  fraction01,
  range0_14,
  range0_100,
  selectRequired,
};
