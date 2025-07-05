import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentTextIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
  };

  const analyzeDocument = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      setIsUploading(true);
      const response = await axios.post('http://localhost:4000/api/apa/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setAnalysis(response.data);
      toast.success('¡Análisis completado con éxito!');
    } catch (error) {
      console.error('Error al analizar el documento:', error);
      toast.error(error.response?.data?.message || 'Error al analizar el documento');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analizador de Normas APA</h1>
            <p className="text-gray-600">
              Sube tu documento para verificar el cumplimiento de las normas APA 7ma edición
            </p>
          </div>

          {/* Área de carga */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 mb-8">
            <div 
              {...getRootProps()} 
              className={`text-center cursor-pointer p-4 rounded-md transition-colors ${
                isDragActive ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Suelta el archivo aquí...'
                      : 'Arrastra y suelta tu archivo aquí, o haz clic para seleccionar'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos soportados: PDF, DOCX (máx. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Vista previa del archivo */}
            {file && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={analyzeDocument}
                disabled={!file || isUploading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  !file || isUploading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {isUploading ? 'Analizando...' : 'Analizar Documento'}
              </button>
            </div>
          </div>

          {/* Resultados del análisis */}
          {analysis && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Resultados del Análisis</h2>
              </div>
              
              <div className="bg-gray-50 px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Palabras</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {analysis.wordCount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Caracteres</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {analysis.characterCount?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Errores, advertencias y sugerencias */}
              <div className="divide-y divide-gray-200">
                {analysis.errors?.length > 0 && (
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-red-600 mb-2">
                      Errores de formato APA
                    </h3>
                    <ul className="space-y-2">
                      {analysis.errors.map((error, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.warnings?.length > 0 && (
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-yellow-600 mb-2">
                      Advertencias
                    </h3>
                    <ul className="space-y-2">
                      {analysis.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          {warning.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggestions?.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">
                      Sugerencias de mejora
                    </h3>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {suggestion.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
