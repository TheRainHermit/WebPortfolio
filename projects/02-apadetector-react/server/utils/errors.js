// utils/errors.js
export class AppError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function errorResponse(res, code, message, details = {}, status = 400) {
  res.status(status).json({
    error: { code, message, details }
  });
}