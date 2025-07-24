import { useLanguage } from '../context/LanguageContext';
import I18N from './index';

// Interpolación simple: t('greeting', { name: 'Juan' }) => "Hola Juan"
function interpolate(str, vars = {}) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

// Permite acceder a claves anidadas tipo 'footer.title'
function getNested(obj, path) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

export default function useT() {
  const { lang } = useLanguage();
  /**
   * @param {string} key - clave del texto
   * @param {object} [vars] - variables para interpolar
   * @returns {string}
   */
  const t = (key, vars) => {
    let text = getNested(I18N[lang], key) || getNested(I18N['es'], key);
    if (typeof text !== 'string') text = key;
    return vars ? interpolate(text, vars) : text;
  };
  return t;
}