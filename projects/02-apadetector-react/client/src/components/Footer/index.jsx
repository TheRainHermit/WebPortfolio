import React from 'react';
import { Link } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import './Footer.css';
import useT from '../../i18n/useT';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const t = useT();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">{t('footer.title')}</h3>
          <p className="footer-description">{t('footer.description')}</p>
          <div className="footer-social">
            <a href="https://github.com/TheRainHermit" target="_blank" rel="noopener noreferrer" className="social-link">
              <GitHubIcon className="social-icon" />
            </a>
            <a href="https://linkedin.com/in/mianfamo" target="_blank" rel="noopener noreferrer" className="social-link">
              <LinkedInIcon className="social-icon" />
            </a>
            <a href="mailto:contacto@apadetector.com" className="social-link">
              <EmailIcon className="social-icon" />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">{t('footer.quickLinks')}</h4>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Inicio</Link></li>
            <li><Link to="/about" className="footer-link">Acerca de</Link></li>
            <li><Link to="/contact" className="footer-link">Contacto</Link></li>
            <li><Link to="/privacy" className="footer-link">Política de Privacidad</Link></li>
            <li><Link to="/terms" className="footer-link">Términos de Uso</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">{t('footer.resources')}</h4>
          <ul className="footer-links">
            <li><a href="https://apastyle.apa.org/" target="_blank" rel="noopener noreferrer" className="footer-link">Guía de Estilo APA</a></li>
            <li><a href="https://www.mendeley.com/guides/apa-citation-guide" target="_blank" rel="noopener noreferrer" className="footer-link">Guía de Citas APA</a></li>
            <li><a href="https://www.citationmachine.net/apa" target="_blank" rel="noopener noreferrer" className="footer-link">Generador de Citas</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {currentYear} Miguel Angel Fabra Montaño - TheRainHermit. {t('footer.copyright')}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
