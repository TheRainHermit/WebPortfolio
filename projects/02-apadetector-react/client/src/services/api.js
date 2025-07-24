import axios from 'axios';

const API_URL = 'http://localhost:4000/api/analyze';

export async function uploadAndAnalyze(file, lang = 'es') {
  const formData = new FormData();
  formData.append('file', file);
  // Incluye el idioma como query param
  const response = await axios.post(`${API_URL}?lang=${lang}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function fetchAllDocuments({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({ page, limit, search });
  const { data } = await api.get(`/analyze/documents?${params.toString()}`);
  return data;
}

export async function fetchAnalysisResults(documentId, lang = 'es') {
  const response = await axios.get(`${API_URL}/results/${documentId}?lang=${lang}`);
  return response.data;
}