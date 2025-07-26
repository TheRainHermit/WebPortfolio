import axios from 'axios';

const API_URL = 'http://localhost:4000/api/analyze';

export async function uploadAndAnalyze(file, lang = 'es') {
  try{
    const formData = new FormData();
    formData.append('file', file);
    // Incluye el idioma como query param
    const response = await axios.post(`${API_URL}?lang=${lang}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('response.data:', response.data);
    return response.data;
  } catch (err) {
    console.error('UPLOAD ERROR:', err, err?.response?.data);
    // Si la respuesta es estructurada, lánzala tal cual
    if (err.response && err.response.data && err.response.data.error) {
      throw err.response.data.error;
    }
    // Si no, lanza un error genérico
    throw { code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado.' };
  }
}

export async function fetchAllDocuments({
  page = 1,
  limit = 10,
  search = '',
  mimetype = '',
  dateFrom = '',
  dateTo = '',
  orderBy = 'uploaded_at',
  orderDir = 'DESC'
} = {}) {
  const params = new URLSearchParams({
    page,
    limit,
    search,
    mimetype,
    dateFrom,
    dateTo,
    orderBy,
    orderDir
  });
  try {
    const { data } = await axios.get(`/analyze/documents?${params.toString()}`);
    return data;
  } catch (err) {
    // Si la respuesta es estructurada, lánzala tal cual
    if (err.response && err.response.data && err.response.data.error) {
      throw err.response.data.error;
    }
    // Si no, lanza un error genérico
    throw { code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado.' };
  }
}

export async function fetchAnalysisResults(documentId, lang = 'es') {
  try {
    const response = await axios.get(`${API_URL}/results/${documentId}?lang=${lang}`);
    return response.data;
  } catch (err) {
    // Si la respuesta es estructurada, lánzala tal cual
    if (err.response && err.response.data && err.response.data.error) {
      throw err.response.data.error;
    }
    // Si no, lanza un error genérico
    throw { code: 'UNKNOWN_ERROR', message: 'Ocurrió un error inesperado.' };
  }
}