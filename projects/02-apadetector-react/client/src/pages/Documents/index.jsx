import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllDocuments } from '../../services/api';
import { useLanguage, LANG_OPTIONS } from '../../context/LanguageContext';
import useT from '../../i18n/useT';
import useApiError from '../../hooks/useApiError';
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
  TextField,
  Select,
  FormControl,
  InputLabel,
  Pagination,
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
  const getApiErrorMessage = useApiError();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mimetype, setMimetype] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orderBy, setOrderBy] = useState('uploaded_at');
  const [orderDir, setOrderDir] = useState('DESC');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetchAllDocuments({
      page,
      limit,
      search: debouncedSearch,
      mimetype,
      dateFrom,
      dateTo,
      orderBy,
      orderDir
    })
      .then(({ documents, total, totalPages }) => {
        setDocuments(documents);
        setTotal(total);
        setTotalPages(totalPages);
        setLoading(false);
      })
      .catch((error) => {
        setError(getApiErrorMessage(error));
        setLoading(false);
      });
  }, [page, limit, debouncedSearch, mimetype, dateFrom, dateTo, orderBy, orderDir, lang]);

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

      {/* Filtros avanzados y búsqueda */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2} alignItems="center">
        {/* Búsqueda */}
        <TextField
          label={t('search') || 'Buscar'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          variant="outlined"
        />

        {/* Tipo de archivo */}
        <FormControl size="small" variant="outlined">
          <InputLabel>{t('type') || 'Tipo'}</InputLabel>
          <Select
            label={t('type') || 'Tipo'}
            value={mimetype}
            onChange={e => setMimetype(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <MenuItem value="">{t('all') || 'Todos'}</MenuItem>
            <MenuItem value="application/pdf">PDF</MenuItem>
            <MenuItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</MenuItem>
            <MenuItem value="application/msword">DOC</MenuItem>
            <MenuItem value="text/plain">TXT</MenuItem>
          </Select>
        </FormControl>

        {/* Fecha desde */}
        <TextField
          label={t('dateFrom') || 'Fecha desde'}
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        {/* Fecha hasta */}
        <TextField
          label={t('dateTo') || 'Fecha hasta'}
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        {/* Ordenar por */}
        <FormControl size="small" variant="outlined">
          <InputLabel>{t('orderBy') || 'Ordenar por'}</InputLabel>
          <Select
            label={t('orderBy') || 'Ordenar por'}
            value={orderBy}
            onChange={e => setOrderBy(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <MenuItem value="uploaded_at">{t('date') || 'Fecha'}</MenuItem>
            <MenuItem value="originalname">{t('name') || 'Nombre'}</MenuItem>
            <MenuItem value="size">{t('size') || 'Tamaño'}</MenuItem>
            <MenuItem value="mimetype">{t('type') || 'Tipo'}</MenuItem>
          </Select>
        </FormControl>

        {/* Dirección */}
        <FormControl size="small" variant="outlined">
          <InputLabel>{t('orderDir') || 'Dirección'}</InputLabel>
          <Select
            label={t('orderDir') || 'Dirección'}
            value={orderDir}
            onChange={e => setOrderDir(e.target.value)}
            style={{ minWidth: 100 }}
          >
            <MenuItem value="ASC">{t('asc') || 'Ascendente'}</MenuItem>
            <MenuItem value="DESC">{t('desc') || 'Descendente'}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Paginación */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, val) => setPage(val)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>{t('loading')}</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{getApiErrorMessage(error)}</Alert>
      ) : (Array.isArray(documents) ? documents.length : 0) === 0 ? (
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