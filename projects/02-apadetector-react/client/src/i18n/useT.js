import { useLanguage } from '../context/LanguageContext';
import I18N from './index';

// Interpolación simple: t('greeting', { name: 'Juan' }) => "Hola Juan"
function interpolate(str, vars = {}) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export function useT() {
  const { lang } = useLanguage();
  /**
   * @param {string} key - clave del texto
   * @param {object} [vars] - variables para interpolar
   * @returns {string}
   */
  const t = (key, vars) => {
    const text = I18N[lang]?.[key] || I18N['es']?.[key] || key;
    return vars ? interpolate(text, vars) : text;
  };
  return t;
}