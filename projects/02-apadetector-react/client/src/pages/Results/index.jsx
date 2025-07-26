import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import {
  Button, Typography, CircularProgress, Alert, Box, Paper, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem, AlertTitle, Snackbar
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { useLanguage, LANG_OPTIONS } from '../../context/LanguageContext';
import useT from '../../i18n/useT';
import useApiError from '../../hooks/useApiError';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchAnalysisResults } from '../../services/api';

const COLORS = ['#ff7979', '#f6e58d', '#6ab04c', '#686de0', '#30336b'];

const typeMap = {
  error: { severity: 'error', icon: <ErrorIcon fontSize="inherit" /> },
  warning: { severity: 'warning', icon: <WarningIcon fontSize="inherit" /> },
  suggestion: { severity: 'info', icon: <LightbulbIcon fontSize="inherit" /> },
  info: { severity: 'info', icon: <InfoIcon fontSize="inherit" /> },
  success: { severity: 'success', icon: <CheckCircleIcon fontSize="inherit" /> }
};

export default function Results() {
  const { id } = useParams();
  const { lang, changeLang } = useLanguage();
  const t = useT();
  const getApiErrorMessage = useApiError();
  const navigate = useNavigate();

  //const [document, setDocument] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pieChartData, setPieChartData] = useState([]);
  const [sectionChartData, setSectionChartData] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [width, height] = useWindowSize();

  useEffect(() => {
    setError('');
    //console.log('[useEffect] Triggered for id:', id, 'lang:', lang);
    async function fetchResults() {
      setLoading(true);
      try {
        const data = await fetchAnalysisResults(id, lang);
        // Detecta si la respuesta es realmente de datos completos y no de "processing"
        if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
          setProcessing(false);
          setPollCount(0);
          setDocInfo(data.docInfo);
          setResults(data.results);
          setPieChartData(Array.isArray(data.pieChartData) ? data.pieChartData : []);
          setSectionChartData(Array.isArray(data.sectionChartData) ? data.sectionChartData : []);
          setShowSuccess(true); // <-- Mostrar mensaje de éxito al terminar
        } else {
          setProcessing(true);
          setTimeout(() => setPollCount(c => c + 1), 1200);
        }
        // (Opcional: logs de depuración)
        //console.log('[fetchResults] API FULL DATA:', data);
      } catch (err) {
        // Si el backend responde con status 202 (processing)
        if (err && err.response && err.response.status === 202) {
          setProcessing(true);
          setTimeout(() => setPollCount(c => c + 1), 1200); // Poll cada 1.2s
        } else {
          setError(getApiErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
    // Incluye pollCount en dependencias para hacer polling
  }, [id, lang, pollCount]);

  const handleLangChange = (e) => {
    changeLang(e.target.value);
  };

  // --- Exportación ---
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
    XLSX.writeFile(wb, 'resultados-apa.xlsx');
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('results-summary');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = Math.min(pageWidth - 40, canvas.width);
    const imgHeight = (imgWidth / canvas.width) * canvas.height;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('resultados-apa.pdf');
  };

  // Si el análisis está en curso, muestra solo el mensaje de espera y no renderices nada más
  if (processing) {
    return (
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {t('processingResults') || 'El análisis está en curso. Espera unos segundos...'}
        </Typography>
      </Box>
    );
  }
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>{t('loading')}</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {getApiErrorMessage(error)}
      </Alert>
    );
  }


  return (
    <Box maxWidth="900px" mx="auto" my={4}>
      {/* Mensaje de éxito al finalizar análisis */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3500}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {t('analysisComplete') || '¡Análisis completado exitosamente!'}
        </Alert>
      </Snackbar>

      {/* Confeti animado */}
      {showSuccess && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={500}
          recycle={false}
          gravity={0.25}
          wind={0.01}
          initialVelocityY={15}
          tweenDuration={5000}
          colors={[
            "#1976d2", // azul (Material UI primary)
            "#ffd600", // dorado
            "#43a047", // verde
            "#8e24aa", // violeta
            "#f44336", // rojo
            "#ff9800", // naranja
            "#fff"     // blanco
          ]}
        />
      )}

      {/* Selector de idioma profesional */}
      <Box mb={2} display="flex" alignItems="center">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="lang-select-label">{t('reportLang')}</InputLabel>
          <Select
            labelId="lang-select-label"
            value={lang}
            label={t('reportLang')}
            onChange={e => changeLang(e.target.value)}
          >
            {LANG_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Botones de exportación y analizar nuevo */}
      <Box display="flex" gap={2} mb={2}>
        <Button variant="outlined" onClick={handleExportExcel}>{t('downloadExcel') || 'Descargar Excel'}</Button>
        <Button variant="outlined" onClick={handleExportPDF}>{t('downloadPdf') || 'Descargar PDF'}</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/analyze')}
        >
          {t('analyzeNewDoc') || 'Analizar un nuevo documento'}
        </Button>
      </Box>

      {/* Bloque de resultados y gráficas para exportar */}
      <div id="results-summary">
        <Typography variant="h5" mb={2}>{t('resultsTitle')}</Typography>
        {docInfo && (
          <Typography variant="subtitle1" mb={2}>
            {t('resultsFor')}: <b>{docInfo.originalname}</b> ({docInfo.mimetype}, {Math.round(docInfo.size / 1024)} KB)
          </Typography>
        )}

        {/* Gráficas */}
        <Box display="flex"
          flexWrap="wrap"
          gap={2}
          my={2}
          alignItems="flex-start"
          justifyContent="center"
          sx={{
            rowGap: 8,
            columnGap: 8,
            px: { xs: 0, md: 4 },
            py: { xs: 2, md: 4 },
          }}>
          {/* Pie Chart */}
          <Box>
            <Typography variant="subtitle1" align="center">{t('resultsTypeDistribution') || 'Distribución de tipos'}</Typography>
            <div
              role="img"
              aria-label={t('typeDistributionAlt')}
              tabIndex={0}
              style={{ outline: 'none' }}
            >
              <PieChart width={350} height={250}>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {Array.isArray(pieChartData) && pieChartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
              <Typography
                variant="body2"
                component="p"
                sx={{ position: 'absolute', left: '-9999px' }}
              >
                {pieChartData.map(d => `${t(d.name) || d.name}: ${d.value}`).join(', ')}
              </Typography>
            </div>
          </Box>

          {/* Bar Chart por sección */}
          {Array.isArray(sectionChartData) && sectionChartData.length === 0 && (
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
              {t('noSectionChartData') || 'No se encontraron datos por sección.'}
            </Typography>
          )}
          {Array.isArray(sectionChartData) && sectionChartData.length > 0 && (
            <Box>
              <Typography variant="subtitle1" align="center">{t('resultsBySection') || 'Resultados por sección'}</Typography>
              <div
                role="img"
                aria-label={t('sectionResultsAlt')}
                tabIndex={0}
                style={{ outline: 'none' }}
              >
                <BarChart width={350} height={250} data={sectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" angle={-12} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#686de0" />
                </BarChart>
                {/* Descripción solo para lectores de pantalla */}
                <Typography
                  variant="body2"
                  component="p"
                  sx={{ position: 'absolute', left: '-9999px' }}
                >
                  {sectionChartData.map(d => `${t(d.section) || d.section}: ${d.count}`).join(', ')}
                </Typography>
              </div>
            </Box>
          )}
        </Box>

        {/* Resultados del análisis */}
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" mb={1}>{t('resultsTitle')}</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {Array.isArray(results) && results.map((r, idx) => {
              const map = typeMap[r.type] || typeMap.info;
              const title =
                r.title && typeof r.title === 'string'
                  ? r.title
                  : t(r.type) || r.type.charAt(0).toUpperCase() + r.type.slice(1);
              return (
                <Alert
                  key={idx}
                  severity={map.severity}
                  icon={map.icon}
                  sx={{ alignItems: 'flex-start' }}
                >
                  <AlertTitle>
                    <b>{title}</b>
                  </AlertTitle>
                  <span>{r.message}</span>
                  {r.suggestion && (
                    <Box mt={1} display="flex" alignItems="center">
                      <LightbulbIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="info.main" fontStyle="italic">
                        {t('suggestion')}: {r.suggestion}
                      </Typography>
                    </Box>
                  )}
                  {r.section && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        {t('section')}: {r.section}
                      </Typography>
                    </Box>
                  )}
                </Alert>
              );
            })}
          </Stack>
        </Paper>
      </div>
    </Box>
  );
}