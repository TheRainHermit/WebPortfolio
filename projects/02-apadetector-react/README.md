# APADetector

Herramienta para verificar el cumplimiento de las normas APA en documentos académicos.

## Características

- Análisis de formato según normas APA 7ma edición
- Detección de citas y referencias
- Sugerencias de corrección
- Interfaz intuitiva y fácil de usar

## Requisitos

- Node.js 16+ y npm 8+
- Navegador web moderno

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

02-apadetector-react/
├── client/                  # Frontend React
│   ├── public/
│   └── src/
│       ├── components/      # Componentes reutilizables
│       ├── pages/           # Páginas principales
│       ├── services/        # Llamadas a la API
│       ├── utils/           # Utilidades y validaciones
│       ├── App.jsx
│       └── index.js
├── server/                  # Backend Node.js
│   ├── controllers/         # Lógica de negocio
│   ├── middlewares/         # Middlewares
│   ├── models/              # Modelos de datos
│   ├── routes/              # Rutas de la API
│   ├── services/            # Servicios (lógica de APA)
│   ├── utils/               # Utilidades
│   └── server.js
├── .gitignore
└── README.md

## Tecnologías Utilizadas

- React 18
- Vite
- Material-UI
- React Router
- Axios

## Licencia

MIT