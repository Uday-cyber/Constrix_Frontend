import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, RTL_LANGUAGES, translations } from "../i18n/translations";

const STORAGE_KEY = "lang";

const LanguageContext = createContext(null);

const readInitialLanguage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LANGUAGES.some((item) => item.code === stored)) return stored;
  return "en";
};

const getValueByPath = (obj, path) =>
  path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

const applyTemplate = (text, vars = {}) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(() => {
    const t = (key, vars) => {
      const langValue = getValueByPath(translations[language], key);
      const fallbackValue = getValueByPath(translations.en, key);
      const output = typeof langValue === "string" ? langValue : fallbackValue || key;
      return applyTemplate(output, vars);
    };

    return { language, setLanguage, t, languages: LANGUAGES };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
};
