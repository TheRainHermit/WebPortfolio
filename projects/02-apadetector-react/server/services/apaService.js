import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import textract from 'textract';

// Configuración internacionalizada (i18n)
const i18nConfig = {
  es: {
    portadaKeywords: ['universidad', 'facultad', 'título', 'autor', 'fecha'],
    resumenKeywords: ['resumen'],
    referenciasKeywords: ['referencias'],
    headers: [
      ['introducción'],
      ['metodología', 'métodos'],
      ['resultados'],
      ['discusión'],
      ['conclusión']
    ],
    messages: {
      portada: 'No se detectó una portada completa (universidad, facultad, título, autor, fecha).',
      resumen: 'No se encontró una sección de resumen.',
      referencias: 'No se encontró una sección de referencias.',
      sugerenciaPortada: 'Asegúrate de incluir todos los elementos de la portada según APA.',
      sugerenciaResumen: 'Incluye una sección de resumen después de la portada.',
      sugerenciaReferencias: 'Incluye una sección de referencias al final del documento.',
      headerMissing: nombre => `No se encontró la sección "${nombre}".`,
      headerSuggestion: nombre => `Incluye una sección "${nombre}" en tu documento.`,
      headerOrderMissing: 'No se pudo evaluar el orden de los encabezados principales porque falta(n) uno o más encabezados clave.',
      headerOrderSuggestion: 'Asegúrate de incluir todos los encabezados principales (Introducción, Metodología, Resultados, Discusión, Conclusión) para poder evaluar el orden APA.',
      headerOrderWrong: 'Los encabezados principales no están en el orden recomendado APA.',
      headerOrderWrongSuggestion: 'Asegúrate de que la estructura del documento siga el orden APA: Introducción, Metodología, Resultados, Discusión, Conclusión.',
      headerOrderCorrect: 'Los encabezados principales están en el orden correcto.',
      citationsFew: 'No se detectaron suficientes citas en el texto con formato APA (Apellido, año) o variantes.',
      citationsFewSuggestion: 'Incluye citas en el texto siguiendo el formato APA, por ejemplo: (Pérez & Gómez, 2020), (Smith et al., 2020).',
      citationsCount: num => `Se detectaron ${num} cita(s) en el texto con formato APA o variantes.`,
      minor: 'El documento solo requiere revisión menor. No se detectaron errores ni advertencias importantes.',
      minorSuggestion: 'Revisa los detalles informativos para mejorar aún más tu documento.',
      success: '¡El documento cumple con las validaciones APA básicas!'
    }
  },
  en: {
    portadaKeywords: ['university', 'faculty', 'title', 'author', 'date'],
    resumenKeywords: ['abstract'],
    referenciasKeywords: ['references'],
    headers: [
      ['introduction'],
      ['methodology', 'methods'],
      ['results'],
      ['discussion'],
      ['conclusion']
    ],
    messages: {
      portada: 'No complete cover page detected (university, faculty, title, author, date).',
      resumen: 'No abstract section found.',
      referencias: 'No references section found.',
      sugerenciaPortada: 'Make sure to include all cover page elements according to APA.',
      sugerenciaResumen: 'Include an abstract section after the cover page.',
      sugerenciaReferencias: 'Include a references section at the end of the document.',
      headerMissing: name => `Section "${name}" not found.`,
      headerSuggestion: name => `Include a "${name}" section in your document.`,
      headerOrderMissing: 'Could not evaluate the order of main headers because one or more key headers are missing.',
      headerOrderSuggestion: 'Make sure to include all main headers (Introduction, Methodology, Results, Discussion, Conclusion) to evaluate APA order.',
      headerOrderWrong: 'Main headers are not in the recommended APA order.',
      headerOrderWrongSuggestion: 'Ensure your document follows the APA structure: Introduction, Methodology, Results, Discussion, Conclusion.',
      headerOrderCorrect: 'Main headers are in the correct order.',
      citationsFew: 'Not enough APA-style citations detected in the text (Author, year) or variants.',
      citationsFewSuggestion: 'Include citations in APA format, e.g.: (Smith & Jones, 2020), (Smith et al., 2020).',
      citationsCount: num => `${num} APA-style citation(s) or variants detected in the text.`,
      minor: 'The document only requires minor review. No major errors or warnings were found.',
      minorSuggestion: 'Check the informational details to further improve your document.',
      success: 'The document passes basic APA validations!'
    }
  }
  // Puedes agregar más idiomas aquí
};

// Regex mejorado para referencias APA (acepta múltiples autores, iniciales, año, título, etc.)
const apaRefRegex = /^([A-Z][a-zA-Záéíóúüñ]+, (?:[A-Z]\.\s?)+(?:, [A-Z][a-zA-Záéíóúüñ]+, (?:[A-Z]\.\s?)+)*(?:,? (?:&|y) [A-Z][a-zA-Záéíóúüñ]+, (?:[A-Z]\.\s?)+)?) \(\d{4}\)\. .+?\./m;

export async function analyzeFile(filePath, mimetype, lang = 'es') {
  const config = i18nConfig[lang] || i18nConfig['es'];
  let text = '';
  const results = [];
  let numPages = null;

  try {
    // Leer el contenido según el tipo de archivo
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
      numPages = pdfData.numpages || (pdfData && pdfData.pdfInfo && pdfData.pdfInfo.numpages);
    }
    else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    }
    else if (mimetype === 'application/vnd.oasis.opendocument.text') {
      // Extraer texto de ODT usando textract (función async)
      text = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (error, text) => {
          if (error) reject(error);
          else resolve(text);
        });
      });
    }
    else {
      text = fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    results.push({
      type: 'error',
      title: 'Error al leer el archivo',
      message: 'No se pudo leer el archivo o el formato es inválido/corrupto.',
      suggestion: 'Verifica que el archivo esté bien formado y no esté dañado. Solo se aceptan archivos PDF, DOCX, ODT o TXT legibles.'
    });
    return results;
  }

  // --- Límite de performance ---
  const MAX_LINES = 5000;
  const MAX_WORDS = 100000;
  const linesArray = text.split('\n');
  if (linesArray.length > MAX_LINES) {
    results.push({
      type: 'error',
      title: 'Error al leer el archivo',
      message: `El documento es demasiado grande (${linesArray.length} líneas).`,
      suggestion: `Reduce el documento a menos de ${MAX_LINES} líneas antes de analizarlo.`
    });
    return results;
  }
  const totalWords = text.split(/\s+/).filter(Boolean).length;
  if (totalWords > MAX_WORDS) {
    results.push({
      type: 'error',
      title: 'Error al leer el archivo',
      message: `El documento es demasiado grande (${totalWords} palabras).`,
      suggestion: `Reduce el documento a menos de ${MAX_WORDS} palabras antes de analizarlo.`
    });
    return results;
  }

  // --- Validación de longitud mínima por páginas (solo PDF) ---
  if (numPages !== null && numPages < 2) {
    results.push({
      type: 'warning',
      title: 'Advertencia',
      message: `El documento PDF tiene solo ${numPages} página(s).`,
      suggestion: 'Se recomienda que el documento tenga al menos 2 páginas.'
    });
  }

  // --- Validación de longitud mínima por palabras (universal) ---
  const minWords = 500;
  const wordCount = totalWords;
  if (wordCount < minWords) {
    results.push({
      type: 'warning',
      title: 'Advertencia',
      message: `El documento es muy corto (${wordCount} palabras).`,
      suggestion: `Asegúrate de que el documento tenga al menos ${minWords} palabras para cumplir con los estándares académicos.`
    });
  }

  // 1. Portada (cover page)
  const portadaRegex = new RegExp(config.portadaKeywords.join('|'), 'i');
  if (!portadaRegex.test(text)) {
    results.push({
      type: 'warning',
      title: 'Advertencia',
      message: config.messages.portada,
      suggestion: config.messages.sugerenciaPortada
    });
  }

  // 2. Resumen/Abstract
  const resumenRegex = new RegExp(config.resumenKeywords.join('|'), 'i');
  if (!resumenRegex.test(text)) {
    results.push({
      type: 'warning',
      title: 'Advertencia',
      message: config.messages.resumen,
      suggestion: config.messages.sugerenciaResumen
    });
  }

  // 3. Referencias/References
  const referenciasRegex = new RegExp(config.referenciasKeywords.join('|'), 'i');
  let numReferencias = 0;
  if (!referenciasRegex.test(text)) {
    results.push({
      type: 'error',
      title: 'Error',
      message: config.messages.referencias,
      suggestion: config.messages.sugerenciaReferencias
    });
  } else {
    // Validar formato de referencias (más robusto)
    const refSection = text.split(referenciasRegex)[1] || '';
    const lines = refSection.split('\n').map(l => l.trim()).filter(l => l);

    // Filtrar solo referencias válidas (no vacías, no encabezados, cumplen patrón APA)
    const filteredRefLines = lines.filter(line =>
      line.length > 0 &&
      !config.referenciasKeywords.some(keyword => line.toLowerCase().includes(keyword)) &&
      /^[A-ZÁÉÍÓÚÜÑ][^:]+?\(\d{4}\)/.test(line)
    );
    numReferencias = filteredRefLines.length;

    // Contar referencias mal formateadas
    let badRefs = 0;
    filteredRefLines.forEach(line => {
      if (!apaRefRegex.test(line)) {
        badRefs++;
      }
    });

    // Si hay referencias pero algunas están mal formateadas
    if (filteredRefLines.length > 0 && badRefs > 0) {
      results.push({
        type: 'suggestion',
        title: 'Sugerencia',
        message: `Se detectaron ${badRefs} referencia(s) que no parecen estar en formato APA.`,
        suggestion: 'Asegúrate de que cada referencia siga el formato: Apellido, Inicial. (Año). Título. Editorial.'
      });
    }

    // Resultado enriquecido: número de referencias encontradas (solo si hay alguna)
    if (numReferencias > 0) {
      results.push({
        type: 'info',
        title: 'Información',
        message: `Se detectaron ${numReferencias} referencia(s) en la sección de referencias.`,
        suggestion: ''
      });
    }

    // Si la sección existe pero no hay ninguna referencia válida
    if (referenciasRegex.test(text) && numReferencias === 0) {
      results.push({
        type: 'warning',
        title: 'Advertencia',
        message: 'No se detectaron referencias válidas en la sección de referencias.',
        suggestion: 'Asegúrate de incluir referencias en formato APA en la sección correspondiente.'
      });
    }
  }

  // 4. Encabezados principales (headers)
  const headers = config.headers;
  const headerOrder = headers.map(hs => {
    const headerRegex = new RegExp(hs.join('|'), 'i');
    const match = text.search(headerRegex);
    return match >= 0 ? match : Infinity;
  });
  const isOrderCorrect = headerOrder.every((val, i, arr) => i === 0 || val >= arr[i - 1]);
  headers.forEach(headerVariants => {
    const headerRegex = new RegExp(headerVariants.join('|'), 'i');
    if (!headerRegex.test(text)) {
      const headerName = headerVariants[0].charAt(0).toUpperCase() + headerVariants[0].slice(1);
      results.push({
        type: 'suggestion',
        title: 'Sugerencia',
        message: config.messages.headerMissing(headerName),
        suggestion: config.messages.headerSuggestion(headerName)
      });
    }
  });
  // Resultado enriquecido: orden de encabezados
  const missingHeaders = headers.filter(headerVariants => {
    const headerRegex = new RegExp(headerVariants.join('|'), 'i');
    return !headerRegex.test(text);
  });
  if (missingHeaders.length > 0) {
    results.push({
      type: 'info',
      title: 'Información',
      message: config.messages.headerOrderMissing,
      suggestion: config.messages.headerOrderSuggestion
    });
  } else if (!isOrderCorrect) {
    results.push({
      type: 'suggestion',
      title: 'Sugerencia',
      message: config.messages.headerOrderWrong,
      suggestion: config.messages.headerOrderWrongSuggestion
    });
  } else {
    results.push({
      type: 'info',
      title: 'Información',
      message: config.messages.headerOrderCorrect,
      suggestion: ''
    });
  }

  // 5. Citas en el texto (APA: variantes)
  const citaRegex = /\(([A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+(?:\s(?:y|&|et al\.)\s[A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+)*(?:, [A-Z]\.)?(?:, [A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+)*(?:; ?[A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+(?:, [A-Z]\.)?,?)*), (\d{4})\)/g;
  const citationMatches = text.match(citaRegex);
  const numCitas = citationMatches ? citationMatches.length : 0;
  if (!citationMatches || numCitas < 2) {
    results.push({
      type: 'suggestion',
      title: 'Sugerencia',
      message: config.messages.citationsFew,
      suggestion: config.messages.citationsFewSuggestion
    });
  }
  // Resultado enriquecido: número de citas encontradas
  results.push({
    type: 'info',
    title: 'Información',
    message: config.messages.citationsCount(numCitas),
    suggestion: ''
  });

  // 6. Sugerencia general si no hay advertencias, errores ni sugerencias
  const onlyInfo = results.length > 0 && results.every(r => r.type === 'info');
  if (onlyInfo) {
    results.push({
      type: 'minor',
      title: 'Información',
      message: config.messages.minor,
      suggestion: config.messages.minorSuggestion
    });
  } else if (results.length === 0) {
    results.push({
      type: 'success',
      title: 'Éxito',
      message: config.messages.success,
      suggestion: ''
    });
  }

  return results;
}