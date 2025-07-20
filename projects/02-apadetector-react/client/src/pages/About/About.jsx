import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Sobre Nosotros
        </Typography>
        <Typography variant="body1" paragraph>
          Somos un equipo apasionado por la educación y la tecnología, comprometidos con facilitar 
          el proceso de escritura académica mediante herramientas innovadoras.
        </Typography>
        <Typography variant="body1" paragraph>
          Nuestra misión es ayudar a estudiantes, investigadores y profesionales a asegurar que sus 
          documentos cumplan con los estándares de formato APA, ahorrando tiempo y mejorando la calidad 
          de sus trabajos académicos.
        </Typography>
      </Paper>
    </Container>
  );
};

export default About;