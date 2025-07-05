
/**
 * Módulo de validación de normas APA
 * Este módulo contiene las reglas y validaciones para documentos según las normas APA 7ma edición
 */

// Tipos de fuentes comunes en APA
const SOURCE_TYPES = {
  BOOK: 'book',
  JOURNAL: 'journal',
  WEBSITE: 'website',
  NEWSPAPER: 'newspaper',
  THESIS: 'thesis'
};

// Estructura básica de una referencia APA
const REFERENCE_PATTERNS = {
  [SOURCE_TYPES.BOOK]: /^([^,]+),\s*([A-Z]\.(?:\s*[A-Z]\.)*)\s*\(?(\d{4})\)?[.,]?\s*([^,]+)[.,]?\s*([^,]+)[.,]?$/i,
  [SOURCE_TYPES.JOURNAL]: /^([^,]+),\s*([A-Z]\.(?:\s*[A-Z]\.)*)\s*\(?(\d{4})\)?[.,]?\s*([^,]+)[.,]?\s*[A-Z][^,]+,\s*\d+\(\d+\),\s*\d+-\d+\./i,
  [SOURCE_TYPES.WEBSITE]: /^([^,]+),?\s*([A-Z]\.(?:\s*[A-Z]\.)*)?\s*\(?(\d{4})\)?[.,]?\s*([^,]+)[.,]?.*https?:\/\/[^\s]+/i
};

/**
 * Valida el formato de una cita en el texto
 * @param {string} text - Texto a validar
 * @returns {Array} Lista de errores encontrados
 */
export const validateInTextCitations = (text) => {
  const errors = [];
  
  // 1. Validar citas entre paréntesis: (Autor, Año)
  const parentheticalCitationRegex = /\(([^)]+?\s*,\s*\d{4}(?:,?\s*p\.?\s*\d+)?)\)/g;
  let match;
  
  while ((match = parentheticalCitationRegex.exec(text)) !== null) {
    const citation = match[1];
    // Validar que tenga al menos un autor y un año
    if (!/^[^,]+,\s*\d{4}/.test(citation)) {
      errors.push({
        type: 'citation',
        message: `Formato de cita incorrecto: "${citation}"`,
        suggestion: 'Usa el formato: (Autor, Año)'
      });
    }
  }
  
  // 2. Validar citas narrativas: Autor (Año) encontró que...
  const narrativeCitationRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\((\d{4})\)/g;
  while ((match = narrativeCitationRegex.exec(text)) !== null) {
    const [fullMatch, author, year] = match;
    if (!author || !year) {
      errors.push({
        type: 'citation',
        message: 'Formato de cita narrativa incorrecto',
        suggestion: 'Usa el formato: Autor (Año) encontró que...'
      });
    }
  }
  
  return errors;
};

/**
 * Valida el formato de las referencias al final del documento
 * @param {string} references - Texto de las referencias
 * @returns {Array} Lista de errores encontrados
 */
export const validateReferenceList = (references) => {
  const errors = [];
  const referenceLines = references.split('\n').filter(line => line.trim() !== '');
  
  referenceLines.forEach((line, index) => {
    // Verificar sangría francesa
    if (!/^\s{0,3}\S/.test(line)) {
      errors.push({
        type: 'reference',
        line: index + 1,
        message: 'Sangría francesa incorrecta',
        suggestion: 'La primera línea de cada referencia debe tener sangría francesa (0.5 pulgadas)'
      });
    }
    
    // Verificar formato básico de referencia
    let referenceType = null;
    if (line.match(REFERENCE_PATTERNS[SOURCE_TYPES.BOOK])) {
      referenceType = SOURCE_TYPES.BOOK;
    } else if (line.match(REFERENCE_PATTERNS[SOURCE_TYPES.JOURNAL])) {
      referenceType = SOURCE_TYPES.JOURNAL;
    } else if (line.match(REFERENCE_PATTERNS[SOURCE_TYPES.WEBSITE])) {
      referenceType = SOURCE_TYPES.WEBSITE;
    } else {
      errors.push({
        type: 'reference',
        line: index + 1,
        message: 'Formato de referencia no reconocido',
        suggestion: 'Revisa el formato según el tipo de fuente (libro, artículo, página web, etc.)'
      });
    }
  });
  
  return errors;
};

/**
 * Valida el formato del documento según normas APA
 * @param {string} text - Texto completo del documento
 * @returns {Object} Resultados de la validación
 */
export const validateApaFormat = (text) => {
  const errors = [];
  const warnings = [];
  
  // 1. Validar título
  const titleMatch = text.match(/^\s*([^\n]+)/);
  if (titleMatch) {
    const title = titleMatch[1].trim();
    // El título debe estar en la primera línea, centrado y en negrita
    if (!/^\s*\*{0,2}[A-Z][^.!?]*[.!?]\*{0,2}\s*$/.test(title)) {
      warnings.push({
        type: 'title',
        message: 'El título debe estar en la primera línea, centrado y en negrita',
        suggestion: 'Centra el título y usa negritas: **Título del documento**'
      });
    }
  }
  
  // 2. Validar encabezados
  const headings = text.match(/^#+\s+.+$/gm) || [];
  headings.forEach((heading, index) => {
    const level = (heading.match(/^#+/g) || [''])[0].length;
    if (level > 5) {
      errors.push({
        type: 'heading',
        message: `Nivel de encabezado no soportado (${level})`,
        suggestion: 'Usa solo niveles del 1 al 5 para los encabezados'
      });
    }
  });
  
  // 3. Validar citas en el texto
  const citationErrors = validateInTextCitations(text);
  errors.push(...citationErrors);
  
  // 4. Validar lista de referencias
  const referencesMatch = text.match(/^Referencias\s*\n+([\s\S]*?)(?=\s*$)/im);
  if (referencesMatch) {
    const referenceErrors = validateReferenceList(referencesMatch[1]);
    errors.push(...referenceErrors);
  } else {
    warnings.push({
      type: 'reference',
      message: 'No se encontró la sección de referencias',
      suggestion: 'Asegúrate de incluir una sección "Referencias" al final del documento'
    });
  }
  
  // 5. Validar márgenes y formato general
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    // Verificar longitud de línea (aproximadamente 12-14 palabras por línea para 1 pulgada de margen)
    const wordCount = line.trim().split(/\s+/).length;
    if (wordCount > 15) {
      warnings.push({
        type: 'format',
        line: index + 1,
        message: 'Línea muy larga',
        suggestion: 'Considera ajustar los márgenes para que haya aproximadamente 12-14 palabras por línea'
      });
    }
  });
  
  return {
    wordCount: text.split(/\s+/).length,
    characterCount: text.length,
    errors,
    warnings,
    suggestions: [
      'Revisa que todas las citas tengan su correspondiente referencia',
      'Verifica que las referencias estén en orden alfabético',
      'Asegúrate de que el interlineado sea de 2.0 en todo el documento'
    ]
  };
};

// Ejemplo de uso:
// const results = validateApaFormat(documentText);
// console.log(results);