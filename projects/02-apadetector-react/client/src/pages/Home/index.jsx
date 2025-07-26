import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import docApproval from '../../assets/lottie/document-approval.json';
const animCopy = JSON.parse(JSON.stringify(docApproval));
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useTheme
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Speed as SpeedIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import useT from '../../i18n/useT';

const features = [
  {
    icon: <DescriptionIcon color="primary" sx={{ fontSize: 50 }} />,
    titleKey: 'landing.benefit1',
    descKey: 'landing.benefit1Desc'
  },
  {
    icon: <CheckCircleIcon color="success" sx={{ fontSize: 50 }} />,
    titleKey: 'landing.benefit2',
    descKey: 'landing.benefit2Desc'
  },
  {
    icon: <SpeedIcon color="secondary" sx={{ fontSize: 50 }} />,
    titleKey: 'landing.benefit3',
    descKey: 'landing.benefit3Desc'
  },
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 50 }} />,
    titleKey: 'landing.benefit4',
    descKey: 'landing.benefit4Desc'
  },
  {
    icon: <PictureAsPdfIcon color="primary" sx={{ fontSize: 50 }} />,
    titleKey: 'landing.benefit5',
    descKey: 'landing.benefit5Desc'
  }
];

export default function Home() {
  const theme = useTheme();
  const t = useT();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: { xs: 4, md: 0 } }}>
      {/* Hero Section */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: '40vh', md: '40vh' },
            mt: 0,
            mb: 0,
            textAlign: 'center',
          }}
        >
          {/* Puedes poner aquí tu logo o ilustración */}
          <Lottie
            animationData={animCopy}
            loop={true}
            style={{ width: 220, height: 220, marginBottom: 14 }}
            aria-label="Animación de documento aprobado"
            title="Animación de documento aprobado"
          />
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: { xs: '2.1rem', md: '3rem' } }}>
            {t('landing.title')}
          </Typography>
          <Typography variant="h5" color="text.secondary" mb={3}>
            {t('landing.subtitle')}
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ mr: 2, minWidth: 180 }}
              onClick={() => navigate('/analyze')}
            >
              {t('landing.cta')}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                  borderRadius: 4,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.04)' }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {t(feature.titleKey)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {t(feature.descKey)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}