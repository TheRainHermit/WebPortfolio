import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import textract from 'textract';

// Configuración internacionalizada (i18n)
const i18nConfig = {
  es: {
    portadaGroups: {
      universidad: [
        'universidad', 'institución universitaria', 'uv', 'instituto', 'instituto tecnológico', 'escuela'
      ],
      facultad: [
        'facultad', 'facultad de', 'división', 'departamento', 'coordinación'
      ],
      titulo: [
        'título', 'titulo', 'integrador', 'proyecto de grado', 'proyecto', 'trabajo', 'tesis', 'tesina'
      ],
      autor: [
        'autor', 'autora', 'elaboró', 'elaborada por', 'presenta', 'presentado por', 'presentada por'
      ],
      fecha: [
        'fecha', 'periodo', 'semestre', 'año', 'mes', 'verano', 'primavera', 'otoño', 'invierno'
      ]
    },
    resumenKeywords: ['resumen'],
    referenciasKeywords: ['referencias', 'bibliografía', 'bibliografia'],
    headers: [
      ['introducción', 'intro'],
      ['metodología', 'métodos', 'metodologías'],
      ['resultados', 'resultados obtenidos'],
      ['discusión', 'análisis', 'discusión de resultados'],
      ['conclusión', 'conclusiones', 'cierre', 'consideraciones finales']
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
    portadaGroups: {
      university: [
        'university', 'university institution', 'uv', 'institute', 'technological institute', 'school'
      ],
      faculty: [
        'faculty', 'faculty of', 'division', 'department', 'coordination'
      ],
      title: [
        'title', 'integrator', 'degree project', 'project', 'work', 'thesis', 'dissertation'
      ],
      author: [
        'author', 'authoress', 'prepared', 'prepared by', 'presents', 'presented by'
      ],
      date: [
        'date', 'period', 'semester', 'year', 'month', 'summer', 'spring', 'autumn', 'winter'
      ]
    },
    resumenKeywords: ['abstract'],
    referenciasKeywords: ['references', 'bibliography'],
    headers: [
      ['introduction', 'intro'],
      ['methodology', 'methods'],
      ['results', 'results obtained'],
      ['discussion', 'analysis', 'discussion'],
      ['conclusion', 'closure', 'final considerations']
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

//Normalización del texto
function normalize(str) {
  return str
    .toLowerCase()                        // Convierte todo a minúsculas
    .normalize("NFD")                     // Quita tildes y diacríticos
    .replace(/[\u0300-\u036f]/g, "")      // Elimina los restos de diacríticos
    .replace(/[“”‘’«»]/g, "")             // Elimina comillas especiales
    .replace(/[^\\w\\s:]/g, "")           // Quita caracteres especiales, pero conserva los dos puntos
    .replace(/\\s+/g, " ")                // Reemplaza múltiples espacios por uno
    .trim();                              // Elimina espacios al inicio y final
}

function buildLooseHeaderRegex(word) {
  // Convierte "REFERENCIAS" en "R\s*E\s*F\s*E\s*R\s*E\s*N\s*C\s*I\s*A\s*S"
  return new RegExp(
    word
      .split('')
      .map(char => `[${char}${char.toLowerCase()}]\\s*`)
      .join(''),
    'm'
  );
}

//Encontrar el último match de un regex
function lastRegexMatchIndex(regex, text) {
  let match;
  let lastIndex = -1;
  let lastMatch;
  while ((match = regex.exec(text)) !== null) {
    lastIndex = match.index;
    lastMatch = match;
    // Evita bucle infinito con regex global sin avance
    if (regex.lastIndex === match.index) regex.lastIndex++;
  }
  return lastIndex;
}

function findLastHeaderIndex(header, text) {
  // Normaliza ambos para evitar problemas de mayúsculas/minúsculas y espacios
  const normText = text.toLowerCase().replace(/[\s\r\n]+/g, '');
  const normHeader = header.toLowerCase().replace(/[\s\r\n]+/g, '');
  return normText.lastIndexOf(normHeader);
}

// Regex mejorado para referencias APA (acepta múltiples autores, iniciales, año, título, etc.)
const apaRefRegex = /^([A-Z][a-zA-Záéíóúüñ]+, (?:[A-Z]\.\s?)+(?:, [A-Z][a-zA-Záéíóúüñ]+, (?:[A-Z]\.\s?)+)*(?:,? (?:&|y) [A-Z][a-zA-Záéíóúüñ]+, (?:[A-Z]\.\s?)+)?) \(\d{4}\)\. .+?\./m;

export async function analyzeFile(filePath, mimetype, lang = 'es') {
  const supportedLangs = ['es', 'en'];
  if (!supportedLangs.includes(lang)) lang = 'es';
  const config = i18nConfig[lang];
  let text = '';
  let results = [];
  let numPages = null;

  try {
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      throw new Error('El archivo no existe en el servidor.');
    }

    const stat = fs.statSync(filePath);
    //console.log('Antes del if PDF, mimetype:', mimetype, 'filePath:', filePath);

    if (mimetype === 'application/pdf') {
      // Extracción de PDF
      //console.log('Entrando a rama PDF');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
      numPages = pdfData.numpages || (pdfData && pdfData.pdfInfo && pdfData.pdfInfo.numpages);
      //console.log('Texto extraído PDF (sin normalizar):', text ? text.slice(0, 2000) : '[VACÍO]');
      //console.log('Longitud texto extraído PDF:', text ? text.length : 0);

      // --- Log de todos los encabezados detectados en el texto completo ---
      const headerRegex = /^.{0,40}(referencias|bibliografia|bibliografía|anexos?|ap[eé]ndice|índice|appendix|attachments?|tables?|figuras?|gráficos?).{0,40}$/gim;
      const allHeaders = [...text.matchAll(headerRegex)].map(m => m[0]);
      //console.log('Encabezados detectados en el texto:', allHeaders);

    } else if (
      mimetype &&
      mimetype.toLowerCase().includes('openxmlformats-officedocument.wordprocessingml.document') ||
      (filePath && filePath.toLowerCase().endsWith('.docx'))
    ) {
      // Extracción de DOCX con manejo robusto de errores y fallback a textract
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        const buffer = fs.readFileSync(filePath);
        const { value } = await mammoth.extractRawText({ buffer });
        text = value;
        if (!text || text.trim().length === 0) throw new Error('Texto vacío tras extracción con Mammoth');
        //console.log('Texto extraído por Mammoth (primeros 2000):', text.slice(0, 2000));
        //console.log('Texto extraído por Mammoth (últimos 2000):', text.slice(-2000));
      } catch (err) {
        console.error('Mammoth extraction failed:', err);
        // Fallback a textract
        try {
          text = await new Promise((resolve, reject) => {
            textract.fromFileWithPath(filePath, (error, extractedText) => {
              if (error) {
                console.error('Textract extraction failed:', error);
                return resolve('');
              }
              resolve(extractedText);
            });
          });
          if (!text || text.trim().length === 0) throw new Error('Texto vacío tras extracción con textract');
          //console.log('Texto extraído por textract (primeros 2000):', text.slice(0, 2000));
          //console.log('Texto extraído por textract (últimos 2000):', text.slice(-2000));
        } catch (err2) {
          console.error('Error extrayendo DOCX con textract:', err2);
          throw new Error('No se pudo extraer el texto del archivo DOCX. Intenta guardarlo de nuevo desde Word o usa otro archivo.');
        }
      }
    } else if (mimetype === 'application/vnd.oasis.opendocument.text') {
      // Extracción de ODT
      try {
        text = await new Promise((resolve, reject) => {
          textract.fromFileWithPath(filePath, (error, text) => {
            if (error) reject(error);
            else resolve(text);
          });
        });
      } catch (err) {
        console.error('Error extrayendo ODT:', err);
        throw new Error('No se pudo extraer el texto del archivo ODT.');
      }
    } else {
      // Por defecto: trata como texto plano
      try {
        text = fs.readFileSync(filePath, 'utf8');
      } catch (err) {
        console.error('Error leyendo archivo como texto plano:', err);
        throw new Error('No se pudo leer el archivo como texto.');
      }
    }
  } catch (err) {
    console.error('ERROR EN ANALISIS:', err);
    throw new Error(err.message || 'No se pudo analizar el archivo. Puede estar corrupto o tener un formato no soportado.');
  }

  // Normalizar el texto (¡ahora sí, después de toda la extracción y fallback!)
  const normalizedText = normalize(text);  // Log temporal para depuración
  //console.log('Texto usado para análisis (primeros 100000):', text.slice(0, 100000));
  //console.log('NormalizedText (primeros 100000):', normalizedText.slice(0, 100000));

  // --- Límite de performance ---
  const MAX_LINES = 20000;
  const MAX_WORDS = 200000;
  const linesArray = text.split('\n');
  if (linesArray.length > MAX_LINES) {
    results.push({
      type: 'error',
      title: lang === 'en' ? 'Error' : 'Error',
      message: `El documento es demasiado grande (${linesArray.length} líneas).`,
      suggestion: `Reduce el documento a menos de ${MAX_LINES} líneas antes de analizarlo.`
    });
    return { results, pieChartData: [], sectionChartData: [] };
  }
  const totalWords = text.split(/\s+/).filter(Boolean).length;
  if (totalWords > MAX_WORDS) {
    results.push({
      type: 'error',
      title: lang === 'en' ? 'Error' : 'Error',
      message: `El documento es demasiado grande (${totalWords} palabras).`,
      suggestion: `Reduce el documento a menos de ${MAX_WORDS} palabras antes de analizarlo.`
    });
    return { results, pieChartData: [], sectionChartData: [] };
  }

  // --- Validación de longitud mínima por páginas (solo PDF) ---
  if (numPages !== null && numPages < 2) {
    results.push({
      type: 'warning',
      title: lang === 'en' ? 'Warning' : 'Advertencia',
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
      title: lang === 'en' ? 'Warning' : 'Advertencia',
      message: `El documento es muy corto (${wordCount} palabras).`,
      suggestion: `Asegúrate de que el documento tenga al menos ${minWords} palabras para cumplir con los estándares académicos.`
    });
  }

  // Selecciona el texto para heurística de portada:
  // - Para PDF: solo la primera página (portadaText)
  // - Para DOCX/ODT: hasta la primera sección fuerte o hasta 80 líneas
  // - Para otros: todo el texto
  let portadaHeuristicaText;

  // --- Mejora: primero PDF, luego DOCX/ODT, luego general ---
  if (mimetype === 'application/pdf' && typeof portadaText === 'string') {
    let primeraPagina = portadaText.split(/\f|\r?\n\s*\d+\s*\r?\n/)[0];
    // Si no hay salto de página, limitar por líneas
    const primerasLineas = primeraPagina.split('\n').slice(0, 40).join('\n');
    portadaHeuristicaText = primerasLineas;
  } else if (
    mimetype &&
    (
      mimetype.toLowerCase().includes('openxmlformats-officedocument.wordprocessingml.document') ||
      mimetype === 'application/vnd.oasis.opendocument.text' ||
      (filePath && (
        filePath.toLowerCase().endsWith('.docx') ||
        filePath.toLowerCase().endsWith('.odt')
      ))
    )
  ) {
    // DOCX/ODT: hasta la primera sección fuerte o máximo 80 líneas
    const portadaMaxLines = 80;
    const strongHeaders = [
      'INTRODUCCIÓN', 'RESUMEN', 'ABSTRACT', 'CONTENIDO', 'ÍNDICE',
      'TABLA DE CONTENIDO', 'OBJETIVOS', 'PLANTEAMIENTO', 'JUSTIFICACIÓN'
    ];
    const docLines = (text || '').split('\n');
    let portadaEnd = Math.min(docLines.length, portadaMaxLines);
    for (let i = 0; i < Math.min(docLines.length, portadaMaxLines); i++) {
      if (strongHeaders.some(h => docLines[i].toUpperCase().includes(h))) {
        portadaEnd = i;
        break;
      }
    }
    portadaHeuristicaText = docLines.slice(0, portadaEnd).join('\n');
  } else {
    portadaHeuristicaText = text;
  }

  // Normalizar el texto (¡ahora sí, después de toda la extracción y fallback!)
  const normText = text ? text.normalize('NFC') : '';
  // --- Detección robusta de portada con logs y variantes ---
  const portadaLines = portadaHeuristicaText
  .normalize('NFC')
  .split('\n')
  .map(l => l.trim())
  .filter(l =>
    l.length > 0 &&
    !/^(Figura|Tabla|Índice|Pág\.?|Capítulo|Sección|Resumen|Abstract)/i.test(l)
  );
  let detected = {
    universidad: null,
    facultad: null,
    titulo: null,
    autores: [],
    fecha: null
  };


  // Genera ventanas de 2 y 3 líneas consecutivas para detectar frases partidas
  function ventanasDeLineas(lines, size) {
    const res = [];
    for (let i = 0; i <= lines.length - size; i++) {
      // Une solo líneas no vacías
      const chunk = lines.slice(i, i + size).filter(Boolean).join(' ');
      if (chunk.trim().length > 0) res.push(chunk);
    }
    return res;
  }
  // Genera ventanas de 2 a 5 líneas
  let portadaVentanas = [...portadaLines];
  for (let n = 2; n <= 5; n++) {
    portadaVentanas.push(...ventanasDeLineas(portadaLines, n));
  }
  // Agrega toda la portada unida como último recurso
  portadaVentanas.push(portadaLines.join(' '));

  // Universidad: toma la última coincidencia relevante en portadaVentanas
  const universidadRegex = /(UNIVERSIDAD|INSTITUCION|INSTITUCIÓN|UNIVERSITARIA|UNIVERSITARIO)/i;
// Solo buscar en las primeras 25 líneas de portadaLines
const universidadCandidates = portadaLines.slice(0, 25).filter(l => universidadRegex.test(l));
detected.universidad = universidadCandidates.length > 0 ? universidadCandidates[universidadCandidates.length - 1] : null;
  //console.log('Universidad detectada:', detected.universidad);

  // Facultad (o variantes)
  detected.facultad = portadaLines.find(l => /(facultad|departamento|escuela|instituto)/i.test(l));
  //console.log('Facultad/variante detectada:', detected.facultad);

  // Título: línea larga en mayúsculas, no sea universidad/facultad
  detected.titulo = portadaLines.find(l =>
    l.length > 18 &&
    l === l.toUpperCase() &&
    !/universidad|facultad|departamento|escuela|instituto/i.test(l)
  );
  //console.log('Título detectado:', detected.titulo);

  // Autores: SOLO en las primeras 20 líneas, líneas cortas (2-5 palabras), sin instituciones
  const forbiddenAuthorWords = [
    'UNIVERSIDAD', 'INSTITUCION', 'INSTITUCIÓN', 'FACULTAD', 'COLEGIO', 'ESCUELA', 'INSTITUTO'
  ];
  let palabrasNoNombre = [
    'ADMINISTRACIÓN', 'GENERAL', 'DESCRIPCIÓN', 'ANÁLISIS', 'EMPRESA', 'FUNDAMENTOS',
    'APLICADO', 'A', 'LA', 'DE', 'EL', 'Y', 'EN', 'DEL'
  ];
  if (detected.universidad) palabrasNoNombre.push(...detected.universidad.split(/\s+/));
  if (detected.facultad) palabrasNoNombre.push(...detected.facultad.split(/\s+/));
  if (detected.titulo) palabrasNoNombre.push(...detected.titulo.split(/\s+/));
  if (detected.fecha) palabrasNoNombre.push(...detected.fecha.split(/\s+/));
  palabrasNoNombre = palabrasNoNombre.map(w => w.toUpperCase());

  const portadaPrimerasLineas = portadaLines.slice(0, 20);
  detected.autores = portadaPrimerasLineas.filter(l => {
    const lineaMayus = l.toUpperCase();
    const words = l.split(/\s+/);
    return (
      words.length >= 2 && words.length <= 5 &&
      forbiddenAuthorWords.every(w => !lineaMayus.includes(w)) &&
      words.every(w =>
        (w.length >= 3) &&
        (
          /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(w) ||
          /^[A-ZÁÉÍÓÚÑ]+$/.test(w)
        ) &&
        !palabrasNoNombre.includes(w.toUpperCase())
      ) &&
      !/[.:",]/.test(l) &&
      l !== detected.universidad
    );
  });
  // Filtra autores únicos
  detected.autores = Array.from(new Set(detected.autores));
  //console.log('Autores detectados:', detected.autores);

  function limpiarLinea(l) {
    return l.replace(/\s+/g, ' ').trim().toUpperCase();
  }

  // Fecha: busca año o fecha larga, tolerando frases partidas
  detected.fecha = portadaVentanas.find(l => {
    const norm = limpiarLinea(l);
    return /\b(20\d{2}|19\d{2})\b/.test(norm) ||
      /\b\d{1,2} DE [A-ZÁÉÍÓÚÑ]+ DE \d{4}\b/.test(norm);
  });
  //console.log('Fecha detectada:', detected.fecha);

  // Puedes usar detected.universidad, detected.facultad, etc. para validar y armar los warnings.

  // 1. Portada (cover page)
  // --- Detección estricta de portada por grupo ---
  const portadaGroups = config.portadaGroups;
  const portadaFaltantes = [];

  // Validación precisa de elementos de portada
  if (!detected.universidad) portadaFaltantes.push('universidad');
  if (!detected.facultad) portadaFaltantes.push('facultad');
  if (!detected.titulo) portadaFaltantes.push('título');
  if (!detected.autores || detected.autores.length === 0) portadaFaltantes.push('autor');
  if (!detected.fecha) portadaFaltantes.push('fecha');

  if (portadaFaltantes.length > 0) {
    // Traducción automática de nombres de grupo para el mensaje
    const groupLabels = {
      es: {
        universidad: 'universidad',
        facultad: 'facultad',
        titulo: 'título',
        autor: 'autor',
        fecha: 'fecha'
      },
      en: {
        universidad: 'university',
        facultad: 'faculty',
        titulo: 'title',
        autor: 'author',
        fecha: 'date',
        university: 'university',
        faculty: 'faculty',
        title: 'title',
        author: 'author',
        date: 'date'
      }
    };

    // Verifica si ya existe una advertencia de portada incompleta
    const portadaMsgStartEs = 'No se detectó una portada completa';
    const portadaMsgStartEn = 'The cover page is incomplete';
    const yaExiste = results.some(
      r =>
        r.type === 'warning' &&
        r.message &&
        (r.message.startsWith(portadaMsgStartEs) || r.message.startsWith(portadaMsgStartEn))
    );

    if (!yaExiste) {
      results.push({
        type: 'warning',
        title: lang === 'en' ? 'Warning' : 'Advertencia',
        message: lang === 'en'
          ? `The cover page is incomplete. Missing: ${portadaFaltantes.map(g => groupLabels.en[g] || g).join(', ')}.`
          : `No se detectó una portada completa. Faltan: ${portadaFaltantes.map(g => groupLabels.es[g] || g).join(', ')}.`,
        suggestion: lang === 'en'
          ? 'Make sure to include all required cover page elements according to APA.'
          : 'Asegúrate de incluir todos los elementos de la portada según APA.',
        section: lang === 'en' ? 'Cover page' : 'Portada'
      });
    }
  }

  // 2. Resumen/Abstract
  const resumenRegex = new RegExp(config.resumenKeywords.join('|'), 'i');
  if (!resumenRegex.test(text)) {
    results.push({
      type: 'warning',
      title: lang === 'en' ? 'Warning' : 'Advertencia',
      message: config.messages.resumen,
      suggestion: config.messages.sugerenciaResumen,
      section: lang === 'en' ? 'Abstract' : 'Resumen'
    });
  }

  // --- 3. Referencias/References (multilenguaje robusto) ---
  // --- Detección robusta de encabezados de referencias y bibliografía ---
  // Si es PDF, usar regex tolerante a espacios y saltos de línea
  let hasMainRef = false;
  let hasAltRef = false;
  let referenciasLoose, bibliografiaLoose, bibliografíaLoose;
  let textForHeader = text;
  if (mimetype === 'application/pdf') {
    // Normaliza solo para buscar encabezados (quita espacios y saltos de línea extras)
    textForHeader = text.replace(/[\r\n]+/g, ' ');
    referenciasLoose = buildLooseHeaderRegex('REFERENCIAS');
    bibliografiaLoose = buildLooseHeaderRegex('BIBLIOGRAFIA');
    bibliografíaLoose = buildLooseHeaderRegex('BIBLIOGRAFÍA');
    const lastChunk = text.slice(-20000);
    // Buscar en última parte y en todo el texto colapsado
    if (
      referenciasLoose.test(lastChunk) ||
      referenciasLoose.test(textForHeader)
    ) {
      hasMainRef = true;
    }
    if (
      bibliografiaLoose.test(lastChunk) ||
      bibliografiaLoose.test(textForHeader) ||
      bibliografíaLoose.test(lastChunk) ||
      bibliografíaLoose.test(textForHeader)
    ) {
      hasAltRef = true;
    }
  } else {
    // DOCX y otros: detección tradicional
    const referenciasHeader = /^(\s)*(referencias)(\s|:|$)/im;
    const bibliografiaHeader = /^(\s)*(bibliografia|bibliografía)(\s|:|$)/im;
    if (referenciasHeader.test(text)) {
      hasMainRef = true;
    }
    if (bibliografiaHeader.test(text)) {
      hasAltRef = true;
    }
  }

  // --- Análisis de la sección de referencias (solo si hay referencias o bibliografía) ---
  let refSection = '';
  if (hasMainRef) {
    if (mimetype === 'application/pdf') {
      const idx = findLastHeaderIndex('referencias', text);
      refSection = idx !== -1 ? text.slice(idx) : '';
    } else {
      // DOCX: puedes mantener el split tradicional
      const parts = text.split(/referencias/i);
      refSection = parts.length > 1 ? parts[parts.length - 1] : '';
    }
  } else if (hasAltRef) {
    if (mimetype === 'application/pdf') {
      // Prueba ambos encabezados
      const idx1 = findLastHeaderIndex('bibliografia', text);
      const idx2 = findLastHeaderIndex('bibliografía', text);
      const idx = Math.max(idx1, idx2);
      refSection = idx !== -1 ? text.slice(idx) : '';
    } else {
      const parts = text.split(/bibliografia|bibliografía/i);
      refSection = parts.length > 1 ? parts[parts.length - 1] : '';
    }
    // ADVERTENCIA: Se encontró "Bibliografía" pero no "Referencias"
    results.push({
      type: 'warning',
      title: lang === 'en' ? 'Warning' : 'Advertencia',
      message: lang === 'en'
        ? 'The document uses "Bibliografía" instead of "Referencias" as required by APA style.'
        : 'El documento utiliza "Bibliografía" en lugar de "Referencias", que es lo requerido por el estilo APA.',
      suggestion: lang === 'en'
        ? 'Change the section title to "Referencias" to comply with APA.'
        : 'Cambia el título de la sección a "Referencias" para cumplir con APA.',
      section: lang === 'en' ? 'References' : 'Referencias'
    });
  }

  // --- Limitar la sección de referencias hasta el próximo encabezado fuerte ---
  if (refSection && mimetype === 'application/pdf') {
    const strongHeaders = [
      'anexos?', 'ap[eé]ndice', 'índice', 'appendix', 'attachments?', 'tables?', 'figuras?', 'gráficos?'
    ];
    const nextHeaderRegex = new RegExp(`^\\s*(${strongHeaders.join('|')})\\b`, 'im');
    const match = nextHeaderRegex.exec(refSection);
    if (match && match.index > 0) {
      refSection = refSection.slice(0, match.index);
      //console.log('Sección de referencias recortada hasta el siguiente encabezado fuerte:', match[0]);
    }
  }

  if (refSection) {
    // DEPURACIÓN: muestra el bloque de referencias extraído
    //console.log('Primeros 1000 caracteres de refSection extraída:', refSection.slice(0, 1000));

    const lines = refSection.split('\n').map(l => l.trim()).filter(l => l);
    // DEPURACIÓN: muestra las primeras 10 líneas después del encabezado
    //console.log('Primeras 10 líneas en sección de referencias extraída:', lines.slice(0, 10));
    // Filtrar solo referencias válidas (estricto APA)
    const filteredRefLines = lines.filter(line =>
      line.length > 0 &&
      !config.referenciasKeywords.some(keyword => line.toLowerCase().includes(keyword)) &&
      /^[A-ZÁÉÍÓÚÜÑ][^:]+?\(\d{4}\)/.test(line)
    );
    const numReferences = filteredRefLines.length;

    // Filtrar referencias tolerantes (año entre paréntesis y punto final)
    const tolerantRefLines = lines.filter(line =>
      line.length > 0 &&
      /\(\d{4}\)/.test(line) &&
      /\./.test(line)
    );
    // Solo mostrar advertencia si hay líneas que parecen referencias pero no cumplen APA
    if (numReferences === 0 && tolerantRefLines.length > 0) {
      results.push({
        type: 'suggestion',
        title: lang === 'en' ? 'Suggestion' : 'Sugerencia',
        message: lang === 'en'
          ? `${tolerantRefLines.length} reference(s) detected that do not appear to be in APA format.`
          : `Se detectaron ${tolerantRefLines.length} referencia(s) que no parecen estar en formato APA.`,
        suggestion: lang === 'en'
          ? 'Make sure each reference follows the format: Lastname, Initial. (Year). Title. Publisher.'
          : 'Asegúrate de que cada referencia siga el formato: Apellido, Inicial. (Año). Título. Editorial.',
        section: lang === 'en' ? 'References' : 'Referencias'
      });
    }
    // DEPURACIÓN: muestra las primeras 5 referencias tolerantes detectadas
    //console.log('Primeras 5 referencias detectadas (tolerante):', tolerantRefLines.slice(0, 5));

    // Contar referencias mal formateadas
    let badRefs = 0;
    filteredRefLines.forEach(line => {
      if (!apaRefRegex.test(line)) {
        badRefs++;
      }
    });

    if (filteredRefLines.length > 0 && badRefs > 0) {
      results.push({
        type: 'suggestion',
        title: lang === 'en' ? 'Suggestion' : 'Sugerencia',
        message: lang === 'en'
          ? `${badRefs} reference(s) do not appear to be in APA format.`
          : `Se detectaron ${badRefs} referencia(s) que no parecen estar en formato APA.`,
        suggestion: lang === 'en'
          ? 'Ensure each reference follows the format: Lastname, Initial. (Year). Title. Publisher.'
          : 'Asegúrate de que cada referencia siga el formato: Apellido, Inicial. (Año). Título. Editorial.'
      });
    }

    if (numReferences > 0) {
      results.push({
        type: 'info',
        title: lang === 'en' ? 'Info' : 'Información',
        message: lang === 'en'
          ? `${numReferences} reference(s) detected in the References section.`
          : `Se detectaron ${numReferences} referencia(s) en la sección de referencias.`,
        suggestion: ''
      });
    }

    if (numReferences === 0) {
      results.push({
        type: 'warning',
        title: lang === 'en' ? 'Warning' : 'Advertencia',
        message: lang === 'en'
          ? 'No valid references detected in the References section.'
          : 'No se detectaron referencias válidas en la sección de referencias.',
        suggestion: lang === 'en'
          ? 'Make sure to include APA-formatted references in the corresponding section.'
          : 'Asegúrate de incluir referencias en formato APA en la sección correspondiente.'
      });
    }
  }

  // 4. Encabezados principales (headers)
  // --- Detección de encabezados principales (APA) ---
  const headers = config.headers;
  const missingHeaders = [];
  const headerPositions = [];

  for (const headerVariants of headers) {
    let found = false;
    let minPos = Infinity;
    for (const variant of headerVariants) {
      const variantNorm = normalize(variant);
      // Usar regex robusto para detectar encabezados al inicio de línea, tras salto de línea, etc.
      const regex = new RegExp(`(^|\\n|\\r)\\s*${variantNorm}\\s*($|\\n|\\r|:)`, 'i');
      const match = normalizedText.search(regex);
      if (match >= 0 && match < minPos) minPos = match;
      if (match >= 0) found = true;
    }
    if (!found) missingHeaders.push(headerVariants[0][0].toUpperCase() + headerVariants[0].slice(1));
    else headerPositions.push(minPos);
  }

  // Resultado enriquecido: orden de encabezados
  // Solo evalúa el orden si no faltan encabezados principales
  if (missingHeaders.length > 0) {
    results.push({
      type: 'info',
      title: lang === 'en' ? 'Info' : 'Información',
      message: config.messages.headerOrderMissing,
      suggestion: config.messages.headerOrderSuggestion,
      section: lang === 'en' ? 'Headers' : 'Encabezados'
    });
  } else {
    // --- Orden de encabezados ---
    // Calcula la posición de cada encabezado en el texto normalizado
    const isOrderCorrect = headerPositions.every((pos, i, arr) => i === 0 || pos >= arr[i - 1]);

    if (!isOrderCorrect) {
      results.push({
        type: 'info',
        title: lang === 'en' ? 'Info' : 'Información',
        message: config.messages.headerOrderWrong,
        suggestion: config.messages.headerOrderWrongSuggestion,
        section: lang === 'en' ? 'Headers' : 'Encabezados'
      });
    } else {
      results.push({
        type: 'info',
        title: lang === 'en' ? 'Info' : 'Información',
        message: config.messages.headerOrderCorrect,
        suggestion: '',
        section: lang === 'en' ? 'Headers' : 'Encabezados'
      });
    }
  }

  // 5. Citas en el texto (APA: variantes)
  const citaRegex = /\(([A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+(?:\s(?:y|&|et al\.)\s[A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+)*(?:, [A-Z]\.)?(?:, [A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+)*(?:; ?[A-ZÁÉÍÓÚÜÑ][a-zA-Záéíóúüñ]+(?:, [A-Z]\.)?,?)*), (\d{4})\)/g;
  const citationMatches = text.match(citaRegex);
  const numCitas = citationMatches ? citationMatches.length : 0;
  if (!citationMatches || numCitas < 2) {
    results.push({
      type: 'suggestion',
      title: lang === 'en' ? 'Suggestion' : 'Sugerencia',
      message: config.messages.citationsFew,
      suggestion: config.messages.citationsFewSuggestion,
      section: lang === 'en' ? 'Citations' : 'Citas'
    });
  }
  results.push({
    type: 'info',
    title: lang === 'en' ? 'Info' : 'Información',
    message: config.messages.citationsCount(numCitas),
    suggestion: '',
    section: lang === 'en' ? 'Citations' : 'Citas'
  });

  // 6. Sugerencia general si no hay advertencias, errores ni sugerencias
  const onlyInfo = results.length > 0 && results.every(r => r.type === 'info');
  if (onlyInfo) {
    results.push({
      type: 'minor',
      title: lang === 'en' ? 'Info' : 'Información',
      message: config.messages.minor,
      suggestion: config.messages.minorSuggestion,
      section: lang === 'en' ? 'General' : 'General'
    });
  } else if (results.length === 0) {
    results.push({
      type: 'success',
      title: lang === 'en' ? 'Success' : 'Éxito',
      message: config.messages.success,
      suggestion: '',
      section: lang === 'en' ? 'General' : 'General'
    });
  }

  // Pie y bar chart
  const pieChartData = [];
  const sectionChartData = [];
  const typeCount = {};
  const sectionCount = {};

  results.forEach(r => {
    typeCount[r.type] = (typeCount[r.type] || 0) + 1;
    if (r.section) sectionCount[r.section] = (sectionCount[r.section] || 0) + 1;
  });

  for (const [name, value] of Object.entries(typeCount)) {
    pieChartData.push({ name, value });
  }
  for (const [section, count] of Object.entries(sectionCount)) {
    sectionChartData.push({ section, count });
  }

  return { results, pieChartData, sectionChartData };
}