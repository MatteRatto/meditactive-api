function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Errori di validazione
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: err.errors,
    });
  }

  // Errori del database
  if (err.code && err.code.startsWith("ER_")) {
    // Gestione degli errori specifici di MySQL
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "Duplicate entry",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Database error",
    });
  }

  // Errori 404 - Not Found
  if (err.name === "NotFoundError") {
    return res.status(404).json({
      status: "error",
      message: err.message || "Resource not found",
    });
  }

  // Errori 403 - Forbidden
  if (err.name === "ForbiddenError") {
    return res.status(403).json({
      status: "error",
      message: err.message || "Access denied",
    });
  }

  // Per tutti gli altri errori, rispondiamo con un 500 - Internal Server Error
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
