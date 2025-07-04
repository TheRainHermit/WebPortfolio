import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import QuienesSomos from "./pages/Quienessomos";
import Catalogo from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import Donar from "./pages/Donar";
import Contacto from "./pages/Contacto";
import LoginModal from "./components/LoginModal";
import Registro from "./pages/Registro";
import PerfilUsuario from "./pages/PerfilUsuario";
import { useState } from "react";
import { CartProvider } from "./providers/CartProvider";
import { AuthProvider, useAuth } from "./context/AuthContext";
import InventoryProvider from './context/InventoryContext';
import Footer from "./components/Footer";
import "./styles.css";
import { ToastContainer } from 'react-toastify';
import { InsigniasProvider } from "./context/InsigniasContext";


function App() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  console.log("showLogin:", showLogin);
  return (
    <AuthProvider>
      <CartProvider>
        <InventoryProvider>
          <InsigniasProvider idUsuario={user?.id_usuario}>
            <Router>
              <Navbar onLoginClick={() => setShowLogin(true)} />
              <main>
                <ToastContainer />
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/quienes-somos" element={<QuienesSomos />} />
                  <Route path="/catalogo" element={<Catalogo />} />
                  <Route path="/carrito" element={<Carrito />} />
                  <Route path="/donar" element={<Donar />} />
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/perfil" element={<PerfilUsuario />} />
                </Routes>
                <Footer />
              </main>
              <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
            </Router>
          </InsigniasProvider>
        </InventoryProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;