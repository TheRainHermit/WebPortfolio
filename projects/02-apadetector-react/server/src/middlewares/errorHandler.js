export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  };
  
  export const notFound = (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Ruta no encontrada'
    });
  };