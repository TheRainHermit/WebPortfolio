// Patrones de expresiones regulares para diferentes tipos de citas
const CITATION_PATTERNS = {
    // Cita directa corta: "texto" (Autor, Año, p. X)
    SHORT_QUOTE: /"([^"]+)"\s*\(([^,]+?)\s*,\s*(\d{4})(?:,\s*p\.\s*(\d+))?\)/g,
    
    // Cita directa larga (bloque)
    LONG_QUOTE: /(?:^|\n\n)(\s{5,}.+?)(?=\n\n|$)/gs,
    
    // Cita de parafraseo: (Autor, Año)
    PARAPHRASE: /\(([^,]+?)\s*,\s*(\d{4})(?:,\s*p\.\s*(\d+))?\)/g,
    
    // Cita con varios autores
    MULTIPLE_AUTHORS: /\(([^)]+?)\s*,\s*(\d{4})(?:\s*[;,]?\s*([^)]+?)\s*,\s*(\d{4}))*\)/g
  };
  
  // Patrones para referencias bibliográficas
  const REFERENCE_PATTERNS = {
    // Libro: Autor, A. A. (Año). Título en cursiva. Editorial.
    BOOK: /^([^,]+?),\s*([A-Z](?:\.[A-Z])*)(?:\s+([A-Z](?:\.[A-Z])*))?\s*\((\d{4})\)\s*\.\s*(.+?)\s*:\s*(.+?)\s*\.$/i,
    
    // Artículo: Autor, A. A., & Autor, B. B. (Año). Título. Nombre de la revista, volumen(número), pp-pp.
    JOURNAL: /^([^,]+?),\s*([A-Z](?:\.[A-Z])*)(?:\s+([A-Z](?:\.[A-Z])*))?(?:\s*&\s*([^,]+?),\s*([A-Z](?:\.[A-Z])*)(?:\s+([A-Z](?:\.[A-Z])*))?)*\s*\((\d{4})\)\s*\.\s*(.+?)\s*\.\s*([^,]+?)\s*,\s*(\d+)(?:\((\d+)\))?(?:\s*,\s*([^,]+))?\s*\.?$/i
  };
  
  // Validar formato de citas
  export const validateCitations = (text) => {
    const errors = [];
    const warnings = [];
    const suggestions = [];
  
    // Verificar citas directas cortas
    const shortQuoteMatches = [...text.matchAll(CITATION_PATTERNS.SHORT_QUOTE)];
    shortQuoteMatches.forEach(match => {
      const [fullMatch, quote, author, year, page] = match;
      
      if (quote.length > 40) {
        errors.push({
          type: 'LONG_QUOTE_FORMAT',
          message: 'Las citas de más de 40 palabras deben ir en bloque con sangría',
          position: match.index,
          length: fullMatch.length,
          context: quote,
          suggestion: `\\n\\n    ${quote}\\n\\n(${author}, ${year}${page ? `, p. ${page}` : ''})\\n\\n`
        });
      }
  
      // Validar formato de año
      if (isNaN(parseInt(year))) {
        errors.push({
          type: 'INVALID_YEAR',
          message: `Formato de año inválido: ${year}`,
          position: match.index + match[0].indexOf(year),
          length: year.length,
          context: fullMatch
        });
      }
    });
  
    // Verificar citas de parafraseo
    const paraphraseMatches = [...text.matchAll(CITATION_PATTERNS.PARAPHRASE)];
    paraphraseMatches.forEach(match => {
      const [fullMatch, author, year, page] = match;
      
      if (isNaN(parseInt(year))) {
        errors.push({
          type: 'INVALID_YEAR',
          message: `Formato de año inválido en cita parafraseada: ${year}`,
          position: match.index + match[0].indexOf(year),
          length: year.length,
          context: fullMatch
        });
      }
    });
  
    // Verificar formato de referencias
    const referenceSection = text.split(/(?:\n\s*){2,}/).find(section => 
      section.trim().toLowerCase().includes('referencias') || 
      section.trim().toLowerCase().includes('bibliografía')
    );
  
    if (referenceSection) {
      const references = referenceSection.split(/\n(?=\S)/).slice(1); // Ignorar el título
      references.forEach((ref, index) => {
        if (!REFERENCE_PATTERNS.BOOK.test(ref) && !REFERENCE_PATTERNS.JOURNAL.test(ref)) {
          warnings.push({
            type: 'INVALID_REFERENCE_FORMAT',
            message: `Formato de referencia no reconocido`,
            position: text.indexOf(ref),
            length: ref.length,
            context: ref.substring(0, 100) + (ref.length > 100 ? '...' : ''),
            suggestion: 'Revisa el formato APA para referencias'
          });
        }
      });
    }
  
    return { errors, warnings, suggestions };
  };
  
  // Formatear una referencia en estilo APA
  export const formatReference = (type, data) => {
    if (!type || !data) {
      throw new Error('Tipo y datos son requeridos para formatear la referencia');
    }
  
    try {
      switch (type.toLowerCase()) {
        case 'book':
          return formatBookReference(data);
        case 'journal':
          return formatJournalReference(data);
        default:
          throw new Error(`Tipo de referencia no soportado: ${type}`);
      }
    } catch (error) {
      console.error('Error al formatear referencia:', error);
      throw new Error('Error al formatear la referencia: ' + error.message);
    }
  };
  
  // Formatear referencia de libro
  const formatBookReference = ({ authors, year, title, publisher, location }) => {
    if (!authors || !year || !title || !publisher) {
      throw new Error('Faltan campos requeridos para la referencia de libro');
    }
  
    const formattedAuthors = formatAuthors(Array.isArray(authors) ? authors : [authors]);
    let reference = `${formattedAuthors} (${year}). *${title}*. ${publisher}`;
    
    if (location) {
      reference = reference.replace(publisher, `${publisher}. ${location}`);
    }
    
    return reference + '.';
  };
  
  // Formatear referencia de artículo
  const formatJournalReference = ({ 
    authors, 
    year, 
    title, 
    journal, 
    volume, 
    issue, 
    pages, 
    doi 
  }) => {
    // Validar campos requeridos
    const requiredFields = { authors, year, title, journal, volume };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
  
    if (missingFields.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }
  
    // Formatear autores
    const formattedAuthors = formatAuthors(Array.isArray(authors) ? authors : [authors]);
    
    // Construir la referencia paso a paso
    const referenceParts = [
      `${formattedAuthors} (${year}). ${title}.`,
      `*${journal}*,`,
      `*${volume}*`
    ];
  
    // Agregar número de edición si existe
    if (issue) {
      //referenceParts[referenceParts.length - 1] += [(${issue})](cci:1://file:///d:/WebPortfolio/projects/02-apadetector-react/client/src/App.jsx:0:0-19:1);
      referenceParts[referenceParts.length - 1] += `(${issue})`;
    }
  
    // Agregar páginas si existen
    if (pages) {
      referenceParts.push(`, ${pages}`);
    }
  
    // Unir todas las partes
    let reference = referenceParts.join(' ');
  
    // Agregar DOI si existe
    if (doi) {
      // Limpiar y formatear DOI
      const cleanDOI = doi.replace(/^https?:\/\/doi\.org\//i, '');
      reference += `. https://doi.org/${cleanDOI}`;
    } else {
      reference += '.';
    }
  
    return reference;
  };
  
  // Formatear lista de autores
  const formatAuthors = (authors) => {
    if (!Array.isArray(authors) || authors.length === 0) {
      throw new Error('Se requiere al menos un autor');
    }
  
    return authors.map((author, index) => {
      if (typeof author !== 'string') {
        throw new Error(`Autor inválido en la posición ${index}`);
      }
      
      const trimmedAuthor = author.trim();
      if (!trimmedAuthor) {
        throw new Error(`Autor vacío en la posición ${index}`);
      }
  
      if (index === 0) return trimmedAuthor;
      if (index === authors.length - 1) {
        return authors.length === 2 ? ` & ${trimmedAuthor}` : `, & ${trimmedAuthor}`;
      }
      return `, ${trimmedAuthor}`;
    }).join('');
  };
  
  export default {
    validateCitations,
    formatReference
  };