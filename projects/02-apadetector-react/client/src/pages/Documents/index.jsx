import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllDocuments } from '../../services/api';
import { useLanguage, LANG_OPTIONS } from '../../context/LanguageContext';
import { useT } from '../../i18n/useT';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem
} from '@mui/material';

const I18N = {
  es: {
    documentsTitle: 'Mis Documentos Analizados',
    uploadNew: 'Subir Nuevo Documento',
    name: 'Nombre',
    type: 'Tipo',
    size: 'Tamaño',
    date: 'Fecha',
    actions: 'Acciones',
    view: 'Ver',
    noDocuments: 'No tienes documentos analizados aún.',
    loading: 'Cargando documentos...',
    error: 'No se pudieron cargar los documentos.',
    reportLang: 'Idioma del reporte'
  },
  en: {
    documentsTitle: 'My Analyzed Documents',
    uploadNew: 'Upload New Document',
    name: 'Name',
    type: 'Type',
    size: 'Size',
    date: 'Date',
    actions: 'Actions',
    view: 'View',
    noDocuments: 'You have no analyzed documents yet.',
    loading: 'Loading documents...',
    error: 'Failed to load documents.',
    reportLang: 'Report language'
  }
};

export default function Documents() {
  const { lang, changeLang } = useLanguage();
  const t = useT();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchAllDocuments()
      .then(data => {
        setDocuments(data.documents || []);
        setLoading(false);
      })
      .catch(() => {
        setError(t('error'));
        setLoading(false);
      });
  }, [lang]); // Si tus documentos dependen del idioma, sino puedes quitar lang

  const handleLangChange = (e) => {
    changeLang(e.target.value);
  };

  return (
    <Box maxWidth={900} mx="auto" mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('documentsTitle')}</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/analyze')}>
          {t('uploadNew')}
        </Button>
      </Box>

      {/* Selector de idioma global */}
      <Box mb={2}>
        <label>
          {t('reportLang')}:&nbsp;
          <Select value={lang} onChange={handleLangChange} size="small">
            {LANG_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </label>
      </Box>

      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{t('loading')}</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{t('error')}</Alert>
      ) : documents.length === 0 ? (
        <Alert severity="info">{t('noDocuments')}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell>{t('size')}</TableCell>
                <TableCell>{t('date')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc._id || doc.id}>
                  <TableCell>{doc.originalName || doc.name}</TableCell>
                  <TableCell>{doc.mimetype}</TableCell>
                  <TableCell>{Math.round((doc.size || 0) / 1024)} KB</TableCell>
                  <TableCell>{new Date(doc.uploaded_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/results/${doc._id || doc.id}`)}
                    >
                      {t('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}