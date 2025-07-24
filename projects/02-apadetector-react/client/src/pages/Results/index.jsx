import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button, Typography, CircularProgress, Alert, Box, Paper, Stack, Divider, List, ListItem, ListItemText, Select, MenuItem
} from '@mui/material';
import { useLanguage, LANG_OPTIONS } from '../../context/LanguageContext';
import useT from '../../i18n/useT';
import useApiError from '../../hooks/useApiError';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchAnalysisResults } from '../../services/api';

const COLORS = ['#ff7979', '#f6e58d', '#6ab04c', '#686de0', '#30336b'];

export default function Results() {
  const { id } = useParams();
  const { lang, changeLang } = useLanguage();
  const t = useT();
  const getApiErrorMessage = useApiError();

  //const [document, setDocument] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    async function fetchResults() {
      setLoading(true);
      try {
        const data = await fetchAnalysisResults(id, lang);
        setDocInfo(data.docInfo);
        setResults(data.results);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id, lang]);

  const handleLangChange = (e) => {
    changeLang(e.target.value);
  };

  // --- Gráficas ---
  const summary = results.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(summary).map(([type, count]) => ({
    name: t(type),
    value: count
  }));

  const sectionData = results.reduce((acc, r) => {
    if (r.section) acc[r.section] = (acc[r.section] || 0) + 1;
    return acc;
  }, {});
  const sectionChartData = Object.entries(sectionData).map(([section, count]) => ({
    section,
    count
  }));

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
      {/* Selector de idioma */}
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

      {/* Botones de exportación */}
      <Box display="flex" gap={2} mb={2}>
        <Button variant="outlined" onClick={handleExportExcel}>{t('downloadExcel') || 'Descargar Excel'}</Button>
        <Button variant="outlined" onClick={handleExportPDF}>{t('downloadPdf') || 'Descargar PDF'}</Button>
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
        <Box display="flex" flexWrap="wrap" gap={4} my={4} justifyContent="center">
          {/* Pie Chart */}
          <Box>
            <Typography variant="subtitle1" align="center">{t('resultsTypeDistribution') || 'Distribución de tipos'}</Typography>
            <PieChart width={300} height={220}>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Box>

          {/* Bar Chart por sección */}
          {sectionChartData.length > 0 && (
            <Box>
              <Typography variant="subtitle1" align="center">{t('resultsBySection') || 'Resultados por sección'}</Typography>
              <BarChart width={340} height={220} data={sectionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#686de0" />
              </BarChart>
            </Box>
          )}
        </Box>

        {/* Lista de resultados */}
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" mb={1}>{t('resultsTitle')}</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {results.map((r, idx) => (
              <ListItem key={idx} alignItems="flex-start">
                <ListItemText
                  primary={
                    <strong>
                      {t(r.type)}
                      {r.title && typeof r.title === 'string' ? `: ${r.title}` : ''}
                    </strong>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {r.message}
                      </Typography>
                      {r.suggestion && (
                        <>
                          <br />
                          <Typography component="span" variant="body2" color="success.main">
                            {t('suggestion')}: {r.suggestion}
                          </Typography>
                        </>
                      )}
                      {r.section && (
                        <>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {t('section')}: {r.section}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </div>
    </Box>
  );
}