const User = require("../models/User");

const userController = {
  /**
   * Crea un nuovo utente
   * @route POST /api/users
   */
  async create(req, res, next) {
    try {
      const { email, firstName, lastName } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "L'email è già registrata",
        });
      }

      const user = await User.create({ email, firstName, lastName });

      res.status(201).json({
        status: "success",
        message: "Utente creato con successo",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ottiene tutti gli utenti
   * @route GET /api/users
   */
  async getAll(req, res, next) {
    try {
      const users = await User.findAll();

      res.status(200).json({
        status: "success",
        results: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ottiene un utente specifico
   * @route GET /api/users/:id
   */
  async getOne(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Utente non trovato",
        });
      }

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Aggiorna un utente
   * @route PUT /api/users/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { email, firstName, lastName } = req.body;

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          status: "error",
          message: "Utente non trovato",
        });
      }

      if (email && email !== existingUser.email) {
        const userWithEmail = await User.findByEmail(email);
        if (userWithEmail) {
          return res.status(409).json({
            status: "error",
            message: "L'email è già registrata",
          });
        }
      }

      const updatedUser = await User.update(id, { email, firstName, lastName });

      res.status(200).json({
        status: "success",
        message: "Utente aggiornato con successo",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Elimina un utente
   * @route DELETE /api/users/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          status: "error",
          message: "Utente non trovato",
        });
      }

      await User.delete(id);

      res.status(200).json({
        status: "success",
        message: "Utente eliminato con successo",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
