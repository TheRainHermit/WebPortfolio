import React from 'react';
import { Container, Typography, TextField, Button, Grid, Box, Paper } from '@mui/material';
import { Email as EmailIcon, LocationOn as LocationIcon, Phone as PhoneIcon } from '@mui/icons-material';

const Contact = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Contáctanos
            </Typography>
            <Typography variant="body1" paragraph>
              ¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte.
            </Typography>
            
            <Box sx={{ mt: 4, '& > div': { mb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon color="primary" sx={{ mr: 2 }} />
                <Typography>Cali, Colombia</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="primary" sx={{ mr: 2 }} />
                <Typography>contacto@apadetector.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Typography>+57 3194247585</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, height: '100%' }}>
            <form>
              <TextField
                fullWidth
                label="Nombre"
                variant="outlined"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Correo Electrónico"
                variant="outlined"
                margin="normal"
                type="email"
                required
              />
              <TextField
                fullWidth
                label="Asunto"
                variant="outlined"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Mensaje"
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
                required
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ mt: 2 }}
              >
                Enviar Mensaje
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;