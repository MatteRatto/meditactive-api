const express = require("express");
const userController = require("../controllers/UserController");
const { userValidations } = require("../middleware/validator");
const router = express.Router();

/**
 * @route GET /api/users
 * @desc Ottiene tutti gli utenti
 * @access Public
 */
router.get("/", userController.getAll);

/**
 * @route GET /api/users/:id
 * @desc Ottiene un utente specifico
 * @access Public
 */
router.get("/:id", userValidations.getOne, userController.getOne);

/**
 * @route POST /api/users
 * @desc Crea un nuovo utente
 * @access Public
 */
router.post("/", userValidations.create, userController.create);

/**
 * @route PUT /api/users/:id
 * @desc Aggiorna un utente
 * @access Public
 */
router.put("/:id", userValidations.update, userController.update);

/**
 * @route DELETE /api/users/:id
 * @desc Elimina un utente
 * @access Public
 */
router.delete("/:id", userValidations.delete, userController.delete);

module.exports = router;
