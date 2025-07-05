import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
//import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import ExamplesPage from './pages/ExamplesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/estadisticas" element={<StatsPage />} />
            <Route path="/ejemplos" element={<ExamplesPage />} />
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
                    <a 
                      href="/" 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Volver al inicio
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
