import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h1" component="h1" sx={{ fontSize: '8rem', fontWeight: 700, mb: 2, color: 'text.secondary' }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Página no encontrada
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        color="primary"
        size="large"
        startIcon={<HomeIcon />}
        sx={{ 
          px: 4,
          py: 1.5,
          fontSize: '1.1rem',
          textTransform: 'none',
          borderRadius: 2,
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        Volver al Inicio
      </Button>
    </Container>
  );
};

export default NotFound;