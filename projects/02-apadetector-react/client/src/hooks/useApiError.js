import useT from '../i18n/useT';

/**
 * Centraliza la traducción y formato de errores de API.
 * @returns {(error: any) => string}
 */
export default function useApiError() {
  const t = useT();

  /**
   * Recibe un error (de la API o genérico) y devuelve un mensaje listo para mostrar.
   * @param {object|string} error
   * @returns {string}
   */
  function getApiErrorMessage(error) {
    if (!error) return t('error');
    if (typeof error === 'string') return error;
    if (error.code) {
      // Busca traducción por código
      return t(`error.${error.code}`) || error.message || t('error');
    }
    if (error.message) return error.message;
    return t('error');
  }

  return getApiErrorMessage;
}