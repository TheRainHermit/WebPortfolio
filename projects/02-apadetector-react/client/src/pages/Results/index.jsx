import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { fetchAnalysisResults } from '../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { Button, Typography, CircularProgress, Alert, Box, Paper, Stack, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useLanguage, LANG_OPTIONS } from '../../context/LanguageContext';
import useT from '../../i18n/useT';

const I18N = {
  es: {
    back: 'Volver a analizar otro documento',
    resultsTitle: 'Resultados del Análisis',
    resultsFor: 'Resultados para',
    reportLang: 'Idioma del reporte',
    file: 'Archivo',
    type: 'Tipo',
    size: 'Tamaño',
    noResults: 'No se encontraron resultados para este documento.',
    suggestion: 'Sugerencia',
    downloadPdf: 'Descargar PDF',
    downloadExcel: 'Descargar Excel',
    loading: 'Cargando...',
    errorLoading: 'No se pudieron cargar los resultados.',
    uploadedAt: 'Subido el',
    message: 'Mensaje',
    position: 'Posición',
    context: 'Contexto'
  },
  en: {
    back: 'Back to analyze another document',
    resultsTitle: 'Analysis Results',
    resultsFor: 'Results for',
    reportLang: 'Report language',
    file: 'File',
    type: 'Type',
    size: 'Size',
    noResults: 'No results found for this document.',
    suggestion: 'Suggestion',
    downloadPdf: 'Download PDF',
    downloadExcel: 'Download Excel',
    loading: 'Loading...',
    errorLoading: 'Failed to load results.',
    uploadedAt: 'Uploaded at',
    message: 'Message',
    position: 'Position',
    context: 'Context'
  }
};

export default function Results() {
  const { lang, changeLang } = useLanguage();
  const t = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAnalysisResults(id, lang);
        setDocument(data.document);
        setResults(data.results);
      } catch (err) {
        setError('No se pudieron cargar los resultados.');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id, lang]);

  const handleLangChange = (e) => {
    changeLang(e.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>{t.loading}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {t.errorLoading}
      </Alert>
    );
  }

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/analyze')}
        sx={{ mb: 3 }}
      >
        {t('back')}
      </Button>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('resultsTitle')}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {t('resultsFor')}: <strong>{document?.originalname}</strong>
        </Typography>
        {/* Selector de idioma global */}
        <div style={{ margin: '16px 0' }}>
          <label>
            {t('reportLang')}:&nbsp;
            <select value={lang} onChange={handleLangChange}>
              {LANG_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={!results || results.length === 0}
          >
            {t('downloadPdf')}
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownloadExcel}
            disabled={!results || results.length === 0}
          >
            {t('downloadExcel')}
          </Button>
        </Stack>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t('uploadedAt')}: {new Date(document?.uploaded_at).toLocaleString()}
        </Typography>
        <Divider sx={{ my: 2 }} />
        {(!results || results.length === 0) ? (
          <Alert severity="info">{t('noResults')}</Alert>
        ) : (
          <List>
            {results.map((res, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={res.message}
                  secondary={res.suggestion && (
                    <span>
                      <strong>{t('suggestion')}: </strong> {res.suggestion}
                    </span>
                  )}
                  primaryTypographyProps={{ variant: 'body1' }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}