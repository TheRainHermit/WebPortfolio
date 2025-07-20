import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Paper,
  Card,
  CardContent,
  CardActions,
  useTheme
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import './Home.css';

const features = [
  {
    icon: <CheckCircleIcon color="primary" sx={{ fontSize: 50 }} />,
    title: 'Análisis Preciso',
    description: 'Detecta automáticamente errores en el formato APA de tu documento.'
  },
  {
    icon: <SpeedIcon color="primary" sx={{ fontSize: 50 }} />,
    title: 'Rápido y Eficiente',
    description: 'Analiza documentos en segundos y obtén resultados inmediatos.'
  },
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 50 }} />,
    title: 'Aprendizaje Mejorado',
    description: 'Aprende las reglas APA con nuestras explicaciones detalladas.'
  }
];

const Home = () => {
  const theme = useTheme();

  return (
    <Box className="home-container">
      {/* Hero Section */}
      <Box className="hero-section" sx={{ 
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        py: 10,
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Verifica el Formato APA de tus Documentos
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
            Asegúrate de que tus trabajos académicos cumplan con las normas APA de manera fácil y rápida.
          </Typography>
          <Button
            component={Link}
            to="/analyze"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ 
              mt: 2,
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
            Analizar Documento
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Características Principales
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
          Nuestra herramienta está diseñada para hacer que el formateo APA sea sencillo y sin complicaciones.
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        py: 8,
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom>
            ¿Listo para comenzar?
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Sube tu documento ahora y obtén un análisis detallado de su conformidad con las normas APA.
          </Typography>
          <Button
            component={Link}
            to="/analyze"
            variant="contained"
            color="primary"
            size="large"
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
            Comenzar Análisis
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;