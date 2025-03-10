const express = require("express");
const goalController = require("../controllers/goalController");
const { goalValidations } = require("../middleware/validator");
const router = express.Router();

/**
 * @route GET /api/goals
 * @desc Ottiene tutti gli obiettivi
 * @access Public
 */
router.get("/", goalController.getAll);

/**
 * @route GET /api/goals/:id
 * @desc Ottiene un obiettivo specifico
 * @access Public
 */
router.get("/:id", goalValidations.getOne, goalController.getOne);

/**
 * @route GET /api/goals/interval/:intervalId
 * @desc Ottiene tutti gli obiettivi di un intervallo
 * @access Public
 */
router.get("/interval/:intervalId", goalController.getByIntervalId);

/**
 * @route POST /api/goals
 * @desc Crea un nuovo obiettivo
 * @access Public
 */
router.post("/", goalValidations.create, goalController.create);

/**
 * @route PUT /api/goals/:id
 * @desc Aggiorna un obiettivo
 * @access Public
 */
router.put("/:id", goalValidations.update, goalController.update);

/**
 * @route DELETE /api/goals/:id
 * @desc Elimina un obiettivo
 * @access Public
 */
router.delete("/:id", goalValidations.delete, goalController.delete);

module.exports = router;
