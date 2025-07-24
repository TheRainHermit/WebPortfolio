import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LANG_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  // ...otros idiomas
];

export function LanguageProvider({ children }) {
  // Inicializa con el idioma guardado en localStorage o 'es'
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'es');

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook para usar el contexto fácilmente
export function useLanguage() {
  return useContext(LanguageContext);
}