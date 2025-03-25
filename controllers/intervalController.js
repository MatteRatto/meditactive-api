const Interval = require("../models/Interval");
const User = require("../models/User");
const Goal = require("../models/Goal");
const IntervalGoal = require("../models/IntervalGoal");

const intervalController = {
  /**
   * Crea un nuovo intervallo
   * @route POST /api/intervals
   */
  async create(req, res, next) {
    try {
      const { startDate, endDate, userId, goalIds } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Utente non trovato",
        });
      }

      const interval = await Interval.create({ startDate, endDate, userId });

      if (goalIds && Array.isArray(goalIds) && goalIds.length > 0) {
        for (const goalId of goalIds) {
          try {
            await IntervalGoal.associate(interval.id, goalId);
          } catch (error) {
            console.error(
              `Errore nell'associazione dell'obiettivo ${goalId}:`,
              error.message
            );
          }
        }
      }

      const completeInterval = await Interval.findById(interval.id);

      res.status(201).json({
        status: "success",
        message: "Intervallo creato con successo",
        data: completeInterval,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ottiene tutti gli intervalli con filtri opzionali e paginazione
   * @route GET /api/intervals
   */
  async getAll(req, res, next) {
    try {
      const { startDate, endDate, goalId } = req.query;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filters = {};

      if (startDate) {
        filters.startDate = startDate;
      }

      if (endDate) {
        filters.endDate = endDate;
      }

      if (goalId) {
        filters.goalId = goalId;
      }

      filters.skip = skip;
      filters.limit = limit;

      const total = await Interval.count(filters);

      const intervals = await Interval.findAll(filters);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.status(200).json({
        status: "success",
        results: intervals.length,
        data: intervals,
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
   * Ottiene un intervallo specifico
   * @route GET /api/intervals/:id
   */
  async getOne(req, res, next) {
    try {
      const { id } = req.params;

      const interval = await Interval.findById(id);

      if (!interval) {
        return res.status(404).json({
          status: "error",
          message: "Intervallo non trovato",
        });
      }

      res.status(200).json({
        status: "success",
        data: interval,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Aggiorna un intervallo
   * @route PUT /api/intervals/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate, userId } = req.body;

      const existingInterval = await Interval.findById(id);
      if (!existingInterval) {
        return res.status(404).json({
          status: "error",
          message: "Intervallo non trovato",
        });
      }

      if (userId && userId !== existingInterval.userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "Utente non trovato",
          });
        }
      }

      const updatedInterval = await Interval.update(id, {
        startDate,
        endDate,
        userId,
      });

      res.status(200).json({
        status: "success",
        message: "Intervallo aggiornato con successo",
        data: updatedInterval,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Elimina un intervallo
   * @route DELETE /api/intervals/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const existingInterval = await Interval.findById(id);
      if (!existingInterval) {
        return res.status(404).json({
          status: "error",
          message: "Intervallo non trovato",
        });
      }

      await Interval.delete(id);

      res.status(200).json({
        status: "success",
        message: "Intervallo eliminato con successo",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ottiene tutti gli obiettivi associati a un intervallo con paginazione
   * @route GET /api/intervals/:id/goals
   */
  async getIntervalGoals(req, res, next) {
    try {
      const { id } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const interval = await Interval.findById(id);
      if (!interval) {
        return res.status(404).json({
          status: "error",
          message: "Intervallo non trovato",
        });
      }

      const total = await Interval.countGoals(id);

      const goals = await Interval.getGoals(id, { skip, limit });

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
   * Associa un obiettivo a un intervallo
   * @route POST /api/intervals/:id/goals
   */
  async associateGoal(req, res, next) {
    try {
      const { id } = req.params;
      const { goalId } = req.body;

      const interval = await Interval.findById(id);
      if (!interval) {
        return res.status(404).json({
          status: "error",
          message: "Intervallo non trovato",
        });
      }

      const goal = await Goal.findById(goalId);
      if (!goal) {
        return res.status(404).json({
          status: "error",
          message: "Obiettivo non trovato",
        });
      }

      const association = await IntervalGoal.associate(id, goalId);

      res.status(201).json({
        status: "success",
        message: "Obiettivo associato con successo",
        data: association,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Dissocia un obiettivo da un intervallo
   * @route DELETE /api/intervals/:id/goals/:goalId
   */
  async dissociateGoal(req, res, next) {
    try {
      const { id, goalId } = req.params;

      const interval = await Interval.findById(id);
      if (!interval) {
        return res.status(404).json({
          status: "error",
          message: "Intervallo non trovato",
        });
      }

      const goal = await Goal.findById(goalId);
      if (!goal) {
        return res.status(404).json({
          status: "error",
          message: "Obiettivo non trovato",
        });
      }

      const result = await IntervalGoal.dissociate(id, goalId);

      if (!result) {
        return res.status(404).json({
          status: "error",
          message: "Associazione non trovata",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Obiettivo dissociato con successo",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = intervalController;
