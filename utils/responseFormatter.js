/**
 * Formatta una risposta di successo
 * @param {Object} data
 * @param {number} [statusCode=200]
 * @param {string} [message='']
 * @returns {Object}
 */
const success = (data, statusCode = 200, message = "") => {
  return {
    success: true,
    status: statusCode,
    message: message || getDefaultMessageForStatus(statusCode),
    data: data || null,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Formatta una risposta di errore
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {Object} [errors=null]
 * @returns {Object}
 */
const error = (message, statusCode = 500, errors = null) => {
  return {
    success: false,
    status: statusCode,
    message: message || getDefaultMessageForStatus(statusCode),
    errors: errors,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Formatta una risposta di validazione fallita
 * @param {Object} errors
 * @param {string} [message='Validation failed']
 * @returns {Object}
 */
const validationError = (errors, message = "Validation failed") => {
  return error(message, 422, errors);
};

/**
 * Formatta una risposta di risorsa non trovata
 * @param {string} [resource='Resource']
 * @param {string|number} [id='']
 * @returns {Object}
 */
const notFound = (resource = "Resource", id = "") => {
  const message = id
    ? `${resource} with ID ${id} not found`
    : `${resource} not found`;

  return error(message, 404);
};

/**
 * Formatta una risposta per errore di autenticazione
 * @param {string} [message='Authentication required']
 * @returns {Object}
 */
const unauthorized = (message = "Authentication required") => {
  return error(message, 401);
};

/**
 * Formatta una risposta per errore di autorizzazione
 * @param {string} [message='You do not have permission to perform this action']
 * @returns {Object}
 */
const forbidden = (
  message = "You do not have permission to perform this action"
) => {
  return error(message, 403);
};

/**
 * Ottiene un messaggio predefinito per un codice di stato HTTP
 * @param {number} statusCode
 * @returns {string}
 * @private
 */
const getDefaultMessageForStatus = (statusCode) => {
  const statusMessages = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
  };

  return statusMessages[statusCode] || "Unknown Status";
};

/**
 * Middleware per l'invio di risposte formattate
 * Aggiunge metodi di risposta all'oggetto res
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const responseMiddleware = (req, res, next) => {
  res.sendSuccess = (data, statusCode = 200, message = "") => {
    const formattedResponse = success(data, statusCode, message);
    return res.status(statusCode).json(formattedResponse);
  };

  res.sendError = (message, statusCode = 500, errors = null) => {
    const formattedResponse = error(message, statusCode, errors);
    return res.status(statusCode).json(formattedResponse);
  };

  res.sendValidationError = (errors, message = "Validation failed") => {
    const formattedResponse = validationError(errors, message);
    return res.status(422).json(formattedResponse);
  };

  res.sendNotFound = (resource = "Resource", id = "") => {
    const formattedResponse = notFound(resource, id);
    return res.status(404).json(formattedResponse);
  };

  res.sendUnauthorized = (message = "Authentication required") => {
    const formattedResponse = unauthorized(message);
    return res.status(401).json(formattedResponse);
  };

  res.sendForbidden = (
    message = "You do not have permission to perform this action"
  ) => {
    const formattedResponse = forbidden(message);
    return res.status(403).json(formattedResponse);
  };

  next();
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  responseMiddleware,
};
