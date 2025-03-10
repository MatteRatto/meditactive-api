const { validationResult, body, param, query } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: errors.array(),
    });
  }
  next();
};

const userValidations = {
  create: [
    body("email").isEmail().withMessage("Inserisci un indirizzo email valido"),
    body("firstName")
      .notEmpty()
      .withMessage("Il nome è obbligatorio")
      .isLength({ min: 2, max: 50 })
      .withMessage("Il nome deve essere compreso tra 2 e 50 caratteri"),
    body("lastName")
      .notEmpty()
      .withMessage("Il cognome è obbligatorio")
      .isLength({ min: 2, max: 50 })
      .withMessage("Il cognome deve essere compreso tra 2 e 50 caratteri"),
    validate,
  ],
  update: [
    param("id").isInt().withMessage("ID utente non valido"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Inserisci un indirizzo email valido"),
    body("firstName")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Il nome deve essere compreso tra 2 e 50 caratteri"),
    body("lastName")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Il cognome deve essere compreso tra 2 e 50 caratteri"),
    validate,
  ],
  delete: [param("id").isInt().withMessage("ID utente non valido"), validate],
  getOne: [param("id").isInt().withMessage("ID utente non valido"), validate],
};

const intervalValidations = {
  create: [
    body("startDate")
      .isISO8601()
      .withMessage("La data di inizio deve essere una data valida"),
    body("endDate")
      .isISO8601()
      .withMessage("La data di fine deve essere una data valida")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error(
            "La data di fine deve essere successiva alla data di inizio"
          );
        }
        return true;
      }),
    body("userId").isInt().withMessage("ID utente non valido"),
    validate,
  ],
  update: [
    param("id").isInt().withMessage("ID intervallo non valido"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("La data di inizio deve essere una data valida"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("La data di fine deve essere una data valida")
      .custom((value, { req }) => {
        if (
          req.body.startDate &&
          new Date(value) <= new Date(req.body.startDate)
        ) {
          throw new Error(
            "La data di fine deve essere successiva alla data di inizio"
          );
        }
        return true;
      }),
    body("userId").optional().isInt().withMessage("ID utente non valido"),
    validate,
  ],
  delete: [
    param("id").isInt().withMessage("ID intervallo non valido"),
    validate,
  ],
  getOne: [
    param("id").isInt().withMessage("ID intervallo non valido"),
    validate,
  ],
  filter: [
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("La data di inizio deve essere una data valida"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("La data di fine deve essere una data valida"),
    query("goalId").optional().isInt().withMessage("ID obiettivo non valido"),
    validate,
  ],
};

const goalValidations = {
  create: [
    body("name")
      .notEmpty()
      .withMessage("Il nome dell'obiettivo è obbligatorio")
      .isLength({ min: 2, max: 100 })
      .withMessage(
        "Il nome dell'obiettivo deve essere compreso tra 2 e 100 caratteri"
      ),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("La descrizione non può superare i 500 caratteri"),
    validate,
  ],
  update: [
    param("id").isInt().withMessage("ID obiettivo non valido"),
    body("name")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage(
        "Il nome dell'obiettivo deve essere compreso tra 2 e 100 caratteri"
      ),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("La descrizione non può superare i 500 caratteri"),
    validate,
  ],
  delete: [
    param("id").isInt().withMessage("ID obiettivo non valido"),
    validate,
  ],
  getOne: [
    param("id").isInt().withMessage("ID obiettivo non valido"),
    validate,
  ],
};

const intervalGoalValidations = {
  associate: [
    param("id").isInt().withMessage("ID intervallo non valido"),
    body("goalId").isInt().withMessage("ID obiettivo non valido"),
    validate,
  ],
};

module.exports = {
  userValidations,
  intervalValidations,
  goalValidations,
  intervalGoalValidations,
};
