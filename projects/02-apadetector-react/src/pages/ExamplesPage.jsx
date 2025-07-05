import { useState } from 'react';
import { 
  BookOpenIcon,
  NewspaperIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const ExamplesPage = () => {
  const [activeTab, setActiveTab] = useState('libros');

  const examples = {
    libros: [
      {
        title: 'Libro con un autor',
        example: 'Gómez, M. (2020). Psicología del desarrollo. Editorial Universitaria.',
        elements: [
          'Apellido, Inicial(es) del nombre. (Año).',
          'Título del libro en cursiva.',
          'Editorial.'
        ]
      },
      {
        title: 'Libro con dos autores',
        example: 'Rodríguez, P. y López, M. (2019). Métodos de investigación cualitativa. Ediciones Académicas.',
        elements: [
          'Primer autor: Apellido, Inicial(es) del nombre.',
          'Segundo autor: Apellido, Inicial(es) del nombre. (Año).',
          'Título del libro en cursiva.',
          'Editorial.'
        ]
      },
      {
        title: 'Libro con editor',
        example: 'Martínez, A. (Ed.). (2021). Avances en inteligencia artificial. Tecnos.',
        elements: [
          'Editor: Apellido, Inicial(es) del nombre. (Ed.). (Año).',
          'Título del libro en cursiva.',
          'Editorial.'
        ]
      }
    ],
    articulos: [
      {
        title: 'Artículo de revista científica',
        example: 'García, L. y Fernández, M. (2022). Impacto del cambio climático en la biodiversidad. Revista Científica de Ecología, 15(3), 245-260. https://doi.org/10.xxxx/yyyy',
        elements: [
          'Autor(es): Apellido, Inicial(es) del nombre. (Año).',
          'Título del artículo.',
          'Nombre de la revista en cursiva, volumen(número),',
          'páginas. DOI o URL'
        ]
      },
      {
        title: 'Artículo de periódico',
        example: 'Sánchez, J. (2023, 15 de marzo). Avances en la investigación del cáncer. El País, pp. 12-13.',
        elements: [
          'Autor: Apellido, Inicial(es) del nombre. (Año, día mes).',
          'Título del artículo.',
          'Nombre del periódico en cursiva, pp. páginas.'
        ]
      }
    ],
    web: [
      {
        title: 'Página web con autor',
        example: 'Pérez, A. (2022, 10 de junio). Guía completa de programación en Python. Aprende Programación. https://www.ejemplo.com/guia-python',
        elements: [
          'Autor: Apellido, Inicial(es) del nombre. (Año, día mes).',
          'Título de la página en cursiva.',
          'Nombre del sitio web.',
          'URL completa'
        ]
      },
      {
        title: 'Página web sin autor',
        example: 'Organización Mundial de la Salud. (2021). Cambio climático y salud. https://www.who.int/es/health-topics/climate-change',
        elements: [
          'Nombre de la organización. (Año).',
          'Título de la página en cursiva.',
          'URL completa'
        ]
      }
    ]
  };

  const tabs = [
    { id: 'libros', name: 'Libros', icon: BookOpenIcon },
    { id: 'articulos', name: 'Artículos', icon: NewspaperIcon },
    { id: 'web', name: 'Recursos Web', icon: GlobeAltIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Ejemplos de Formato APA</h1>
          <p className="text-lg text-gray-600">
            Guía de referencia rápida para citar correctamente según las normas APA 7ma edición
          </p>
        </div>

        {/* Pestañas */}
        <div className="mb-8">
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">
              Seleccionar categoría
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="space-y-8">
          {examples[activeTab]?.map((example, index) => (
            <div key={index} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-100 p-3 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{example.title}</h3>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700 font-mono">{example.example}</p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Elementos:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {example.elements.map((element, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {element}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consejos adicionales */}
        <div className="mt-12 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600 mr-2" />
              Consejos para citar correctamente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Citas en el texto
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Usa paréntesis con el apellido del autor y el año: (Gómez, 2020).</li>
                  <li>• Para dos autores: (Rodríguez y López, 2019).</li>
                  <li>• Para tres o más autores: (Martínez et al., 2021).</li>
                  <li>• Incluye el número de página para citas textuales: (Pérez, 2022, p. 45).</li>
                </ul>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-2" />
                  Referencias
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Usa sangría francesa (primera línea al margen, siguientes con sangría).</li>
                  <li>• Ordena las referencias alfabéticamente por el apellido del primer autor.</li>
                  <li>• Incluye el DOI cuando esté disponible.</li>
                  <li>• Usa el formato de enlace permanente para recursos en línea.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Nota final */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Esta es una guía de referencia rápida. Para casos específicos o más detalles, 
            consulta el manual oficial de la APA (7ma edición) o el sitio web de la Asociación Americana de Psicología.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamplesPage;
