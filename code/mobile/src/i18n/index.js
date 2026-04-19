import { createContext, useContext, useMemo, useState } from "react";
import en from "./en";
import ar from "./ar";

const CATALOGS = { en, ar };

const I18nContext = createContext({
  lang: "en",
  t: en,
  setLang: () => {},
  isRTL: false,
});

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");
  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: CATALOGS[lang] || CATALOGS.en,
      isRTL: lang === "ar",
    }),
    [lang]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
