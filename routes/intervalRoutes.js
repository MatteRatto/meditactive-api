const express = require("express");
const intervalController = require("../controllers/intervalController");
const {
  intervalValidations,
  intervalGoalValidations,
} = require("../middleware/validator");
const router = express.Router();

/**
 * @route GET /api/intervals
 * @desc Ottiene tutti gli intervalli con filtri opzionali
 * @access Public
 */
router.get("/", intervalValidations.filter, intervalController.getAll);

/**
 * @route GET /api/intervals/:id
 * @desc Ottiene un intervallo specifico
 * @access Public
 */
router.get("/:id", intervalValidations.getOne, intervalController.getOne);

/**
 * @route GET /api/intervals/user/:userId
 * @desc Ottiene tutti gli intervalli di un utente
 * @access Public
 */
router.get("/user/:userId", intervalController.getByUserId);

/**
 * @route POST /api/intervals
 * @desc Crea un nuovo intervallo
 * @access Public
 */
router.post("/", intervalValidations.create, intervalController.create);

/**
 * @route PUT /api/intervals/:id
 * @desc Aggiorna un intervallo
 * @access Public
 */
router.put("/:id", intervalValidations.update, intervalController.update);

/**
 * @route DELETE /api/intervals/:id
 * @desc Elimina un intervallo
 * @access Public
 */
router.delete("/:id", intervalValidations.delete, intervalController.delete);

/**
 * @route POST /api/intervals/:id/goals
 * @desc Associa un obiettivo a un intervallo
 * @access Public
 */
router.post(
  "/:id/goals",
  intervalGoalValidations.associate,
  intervalController.associateGoal
);

/**
 * @route DELETE /api/intervals/:id/goals/:goalId
 * @desc Dissocia un obiettivo da un intervallo
 * @access Public
 */
router.delete("/:id/goals/:goalId", intervalController.dissociateGoal);

module.exports = router;

/**
 * @route GET /api/intervals/:id/goals
 * @desc Ottiene tutti gli obiettivi associati a un intervallo
 * @access Public
 */
router.get("/:id/goals", intervalController.getIntervalGoals);
