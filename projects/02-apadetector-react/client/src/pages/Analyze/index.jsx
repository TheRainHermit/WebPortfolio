import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  CircularProgress, 
  Divider, 
  Grid, 
  IconButton, 
  Paper, 
  Tab, 
  Tabs, 
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Description as DescriptionIcon, 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import './Analyze.css';

// Componente para mostrar el archivo cargado
const FilePreview = ({ file, onRemove }) => {
  return (
    <Paper 
      elevation={0}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'action.hover',
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DescriptionIcon color="primary" />
        <Box>
          <Typography variant="body1" noWrap>{file.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {(file.size / 1024).toFixed(2)} KB
          </Typography>
        </Box>
      </Box>
      <IconButton onClick={onRemove} size="small" color="error">
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
};

// Componente para mostrar un resultado de análisis
const AnalysisResult = ({ result, index }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 1,
        bgcolor: result.type === 'error' ? 'error.light' : 'success.light',
        color: result.type === 'error' ? 'error.contrastText' : 'success.contrastText',
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
      }}
    >
      {result.type === 'error' ? (
        <ErrorIcon />
      ) : (
        <CheckCircleIcon />
      )}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
          {result.title}
        </Typography>
        <Typography variant="body2">
          {result.message}
        </Typography>
        {result.suggestion && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.9 }}>
            <strong>Sugerencia:</strong> {result.suggestion}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
const Analyze = () => {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Configuración de dropzone
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  // Manejadores
  const handleRemoveFile = () => {
    setFile(null);
    setResults([]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAnalyze = () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: 'Por favor, selecciona un archivo para analizar',
        severity: 'warning'
      });
      return;
    }

    setIsAnalyzing(true);
    setResults([]);

    // Simulación de análisis (reemplazar con llamada a la API real)
    setTimeout(() => {
      // Datos de ejemplo para la simulación
      const mockResults = [
        {
          id: 1,
          type: 'success',
          title: 'Formato de título',
          message: 'El formato del título cumple con las normas APA',
          section: 'formato',
          page: 1
        },
        {
          id: 2,
          type: 'error',
          title: 'Cita faltante',
          message: 'Falta una cita para la referencia: Smith, 2020',
          suggestion: 'Agrega una cita con (Smith, 2020) en el texto',
          section: 'citas',
          page: 3
        },
        {
          id: 3,
          type: 'error',
          title: 'Formato de referencia',
          message: 'La referencia en la página 2 no sigue el formato APA',
          suggestion: 'Usa el formato: Autor, A. A. (Año). Título. Editorial.',
          section: 'referencias',
          page: 2
        },
        {
          id: 4,
          type: 'success',
          title: 'Márgenes',
          message: 'Los márgenes del documento son correctos (2.54 cm en todos los lados)',
          section: 'formato',
          page: 'all'
        },
      ];

      setResults(mockResults);
      setIsAnalyzing(false);
      setTabValue(1); // Cambiar a la pestaña de resultados
    }, 2000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrar resultados por categoría
  const filteredResults = tabValue === 0 
    ? results 
    : tabValue === 1 
      ? results.filter(r => r.type === 'error')
      : results.filter(r => r.type === 'success');

  return (
    <Box className="analyze-container">
      <Typography variant="h4" component="h1" gutterBottom>
        Analizar Documento
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Sube un documento para analizar su cumplimiento con las normas APA. 
        Puedes subir archivos en formato PDF, Word (.doc, .docx) o texto plano (.txt).
      </Typography>

      <Grid container spacing={3}>
        {/* Panel de carga */}
        <Grid item xs={12} md={5}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subir Documento
              </Typography>
              
              {!file ? (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: 'action.hover',
                    },
                    ...(isDragActive && {
                      borderColor: theme.palette.primary.main,
                      bgcolor: 'action.selected',
                    })
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: 'text.secondary',
                      mb: 1 
                    }} 
                  />
                  <Typography variant="body1" gutterBottom>
                    {isDragActive 
                      ? 'Suelta el archivo aquí' 
                      : 'Arrastra y suelta un archivo, o haz clic para seleccionar'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Formatos soportados: PDF, DOC, DOCX, TXT (máx. 10MB)
                  </Typography>
                </Box>
              ) : (
                <FilePreview file={file} onRemove={handleRemoveFile} />
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
                sx={{ mt: 2 }}
              >
                {isAnalyzing ? 'Analizando...' : 'Analizar Documento'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de resultados */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Resultados del Análisis
                </Typography>
                
                {results.length > 0 && (
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minHeight: 'auto' }}
                  >
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>Todos</span>
                          <Box 
                            sx={{
                              bgcolor: 'text.secondary',
                              color: 'background.paper',
                              borderRadius: '50%',
                              width: 20,
                              height: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                            }}
                          >
                            {results.length}
                          </Box>
                        </Box>
                      } 
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ErrorIcon color="error" fontSize="small" />
                          <span>Errores</span>
                          <Box 
                            sx={{
                              bgcolor: 'error.main',
                              color: 'error.contrastText',
                              borderRadius: '50%',
                              width: 20,
                              height: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                            }}
                          >
                            {results.filter(r => r.type === 'error').length}
                          </Box>
                        </Box>
                      } 
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <span>Correctos</span>
                          <Box 
                            sx={{
                              bgcolor: 'success.main',
                              color: 'success.contrastText',
                              borderRadius: '50%',
                              width: 20,
                              height: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                            }}
                          >
                            {results.filter(r => r.type === 'success').length}
                          </Box>
                        </Box>
                      } 
                    />
                  </Tabs>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                {isAnalyzing ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    py: 4
                  }}>
                    <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" align="center">
                      Analizando documento...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Esto puede tomar unos segundos
                    </Typography>
                  </Box>
                ) : results.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    py: 4
                  }}>
                    <DescriptionIcon 
                      sx={{ 
                        fontSize: 64, 
                        color: 'action.disabled',
                        mb: 2 
                      }} 
                    />
                    <Typography variant="h6" color="text.secondary" align="center">
                      {file 
                        ? 'Haz clic en "Analizar Documento" para comenzar' 
                        : 'Sube un documento para comenzar el análisis'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Se mostrarán los resultados del análisis aquí
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {filteredResults.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircleIcon 
                          sx={{ 
                            fontSize: 64, 
                            color: 'success.main',
                            mb: 2 
                          }} 
                        />
                        <Typography variant="h6" color="text.secondary">
                          {tabValue === 1 
                            ? '¡No se encontraron errores!'
                            : 'No hay resultados para mostrar'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tabValue === 1 
                            ? 'El documento cumple con todas las normas APA revisadas.'
                            : 'Intenta cambiar los filtros de búsqueda.'}
                        </Typography>
                      </Box>
                    ) : (
                      filteredResults.map((result) => (
                        <AnalysisResult key={result.id} result={result} />
                      ))
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Analyze;
