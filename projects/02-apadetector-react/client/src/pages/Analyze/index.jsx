import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Button, Typography, Card, CardContent, CircularProgress, Snackbar, Alert as MuiAlert, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadAndAnalyze } from '../../services/api';
import FilePreview from '../../pages/FilePreview';
import { useLanguage, LANG_OPTIONS } from '../../context/LanguageContext';
import useT from '../../i18n/useT';
import useApiError from '../../hooks/useApiError';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.oasis.opendocument.text'
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const Analyze = () => {
  const navigate = useNavigate();
  const { lang, changeLang } = useLanguage();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useT();
  const getApiErrorMessage = useApiError();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles[0]),
    onDropRejected: () => {
      const msg = getApiErrorMessage(error);
      setError(msg);  
      setShowError(true);
    },
    multiple: false,
    maxSize: MAX_SIZE
  });

  const handleLangChange = (e) => {
    changeLang(e.target.value);
  };

  const handleFileChange = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = getApiErrorMessage(error);
      setError(msg);  
      setFile(null);
      setShowError(true);
      return;
    }

    if (file.size > MAX_SIZE) {
      const msg = getApiErrorMessage(error);
      setError(msg);  
      setFile(null);
      setShowError(true);
      return;
    }

    setFile(file);
    setError('');
    setShowError(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
    setShowError(false);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const { documentId } = await uploadAndAnalyze(file, lang);
      navigate(`/results/${documentId}`);
    } catch (err) {
      const msg = getApiErrorMessage(error);
      setError(msg);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Analizar Documento
      </Typography>

      {/* Selector de idioma global */}
      <div style={{ margin: '16px 0' }}>
        <label>
          Idioma del análisis:&nbsp;
          <select value={lang} onChange={handleLangChange}>
            {LANG_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      <Card>
        <CardContent>
          <div {...getRootProps()} style={{
            border: '2px dashed #ccc',
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 16
          }}>
            <input {...getInputProps()} />
            {isDragActive
              ? <p>Suelta el archivo aquí...</p>
              : <p>Arrastra y suelta un archivo aquí, o haz clic para seleccionar uno.</p>
            }
          </div>

          {file && (
            <FilePreview file={file} onRemove={handleRemoveFile} />
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleAnalyze}
            disabled={loading || !file}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('analyze')}
          </Button>
          {error && (
            <MuiAlert severity="error" sx={{ mt: 2 }}>
              {getApiErrorMessage(error)} 
            </MuiAlert>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert severity="error" onClose={() => setShowError(false)} sx={{ width: '100%' }}>
          {getApiErrorMessage(error)}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Analyze;