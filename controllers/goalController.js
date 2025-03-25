const Goal = require("../models/Goal");

const goalController = {
  /**
   * Crea un nuovo obiettivo
   * @route POST /api/goals
   */
  async create(req, res, next) {
    try {
      const { name, description } = req.body;

      const goal = await Goal.create({ name, description });

      res.status(201).json({
        status: "success",
        message: "Obiettivo creato con successo",
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ottiene tutti gli obiettivi con paginazione
   * @route GET /api/goals
   */
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await Goal.count();

      const goals = await Goal.findAll({ skip, limit });

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.status(200).json({
        status: "success",
        results: goals.length,
        data: goals,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          pageSize: limit,
          hasNext,
          hasPrev,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ottiene un obiettivo specifico
   * @route GET /api/goals/:id
   */
  async getOne(req, res, next) {
    try {
      const { id } = req.params;

      const goal = await Goal.findById(id);

      if (!goal) {
        return res.status(404).json({
          status: "error",
          message: "Obiettivo non trovato",
        });
      }

      res.status(200).json({
        status: "success",
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Aggiorna un obiettivo
   * @route PUT /api/goals/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const existingGoal = await Goal.findById(id);
      if (!existingGoal) {
        return res.status(404).json({
          status: "error",
          message: "Obiettivo non trovato",
        });
      }

      const updatedGoal = await Goal.update(id, { name, description });

      res.status(200).json({
        status: "success",
        message: "Obiettivo aggiornato con successo",
        data: updatedGoal,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Elimina un obiettivo
   * @route DELETE /api/goals/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const existingGoal = await Goal.findById(id);
      if (!existingGoal) {
        return res.status(404).json({
          status: "error",
          message: "Obiettivo non trovato",
        });
      }

      await Goal.delete(id);

      res.status(200).json({
        status: "success",
        message: "Obiettivo eliminato con successo",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = goalController;
