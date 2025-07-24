// src/pages/FilePreview.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function FilePreview({ file }) {
  if (!file) return null;

  return (
    <Box mt={2}>
      <Typography variant="subtitle2">Vista previa:</Typography>
      <Typography variant="body2">{file.name} ({Math.round(file.size / 1024)} KB)</Typography>
    </Box>
  );
}