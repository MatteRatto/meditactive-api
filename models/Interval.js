const db = require("../config/database");

class Interval {
  /**
   * Crea un nuovo intervallo
   * @param {Object} intervalData
   * @param {string} intervalData.startDate
   * @param {string} intervalData.endDate
   * @param {number} intervalData.userId
   * @returns {Promise<Object>}
   */
  static async create(intervalData) {
    const { startDate, endDate, userId } = intervalData;

    const sql = `
      INSERT INTO intervals (startDate, endDate, userId)
      VALUES (?, ?, ?)
    `;

    const result = await db.query(sql, [startDate, endDate, userId]);

    return {
      id: result.insertId,
      startDate,
      endDate,
      userId,
    };
  }

  /**
   * Trova un intervallo per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT id, startDate, endDate, userId, createdAt, updatedAt
      FROM intervals
      WHERE id = ?
    `;

    const intervals = await db.query(sql, [id]);

    return intervals.length ? intervals[0] : null;
  }

  /**
   * Conta tutti gli intervalli che corrispondono ai filtri
   * @param {Object} [filters]
   * @returns {Promise<number>}
   */
  static async count(filters = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM intervals
    `;

    const conditions = [];
    const values = [];

    if (filters.userId) {
      conditions.push("userId = ?");
      values.push(filters.userId);
    }

    if (filters.startDate) {
      conditions.push("startDate >= ?");
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push("endDate <= ?");
      values.push(filters.endDate);
    }

    if (filters.goalId) {
      sql = `
        SELECT COUNT(DISTINCT i.id) AS total
        FROM intervals i
        JOIN interval_goals ig ON i.id = ig.intervalId
        WHERE ig.goalId = ?
      `;
      values = [filters.goalId];

      if (filters.userId) {
        sql += " AND i.userId = ?";
        values.push(filters.userId);
      }

      if (filters.startDate) {
        sql += " AND i.startDate >= ?";
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        sql += " AND i.endDate <= ?";
        values.push(filters.endDate);
      }
    } else if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await db.query(sql, values);
    return result[0].total;
  }

  /**
   * Trova tutti gli intervalli con supporto per paginazione
   * @param {Object} [options]
   * @param {number} [options.skip=0]
   * @param {number} [options.limit=10]
   * @param {string} [options.startDate]
   * @param {string} [options.endDate]
   * @param {number} [options.userId]
   * @param {number} [options.goalId]
   * @returns {Promise<Array>}
   */
  static async findAll({ skip = 0, limit = 10, ...filters } = {}) {
    let sql = `
      SELECT id, startDate, endDate, userId, createdAt, updatedAt
      FROM intervals
    `;

    let values = [];

    if (filters.goalId) {
      sql = `
        SELECT DISTINCT i.id, i.startDate, i.endDate, i.userId, i.createdAt, i.updatedAt
        FROM intervals i
        JOIN interval_goals ig ON i.id = ig.intervalId
        WHERE ig.goalId = ?
      `;
      values = [filters.goalId];

      if (filters.userId) {
        sql += " AND i.userId = ?";
        values.push(filters.userId);
      }

      if (filters.startDate) {
        sql += " AND i.startDate >= ?";
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        sql += " AND i.endDate <= ?";
        values.push(filters.endDate);
      }
    } else {
      const conditions = [];

      if (filters.userId) {
        conditions.push("userId = ?");
        values.push(filters.userId);
      }

      if (filters.startDate) {
        conditions.push("startDate >= ?");
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push("endDate <= ?");
        values.push(filters.endDate);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
      }
    }

    sql += ` ORDER BY startDate DESC`;
    sql += ` LIMIT ${parseInt(skip, 10)}, ${parseInt(limit, 10)}`;

    return await db.query(sql, values);
  }

  /**
   * Aggiorna un intervallo
   * @param {number} id
   * @param {Object} intervalData
   * @returns {Promise<Object|null>}
   */
  static async update(id, intervalData) {
    const { startDate, endDate } = intervalData;

    const updateFields = [];
    const values = [];

    if (startDate !== undefined) {
      updateFields.push("startDate = ?");
      values.push(startDate);
    }

    if (endDate !== undefined) {
      updateFields.push("endDate = ?");
      values.push(endDate);
    }

    if (updateFields.length === 0) {
      return null;
    }

    values.push(id);

    const sql = `
      UPDATE intervals
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    const result = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  /**
   * Elimina un intervallo
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const sql = `
      DELETE FROM intervals
      WHERE id = ?
    `;

    const result = await db.query(sql, [id]);

    return result.affectedRows > 0;
  }

  /**
   * Trova tutti gli intervalli di un utente con supporto per paginazione
   * @param {number} userId
   * @param {Object} [options]
   * @param {number} [options.skip=0]
   * @param {number} [options.limit=10]
   * @returns {Promise<Array>}
   */
  static async findByUserId(userId, { skip = 0, limit = 10 } = {}) {
    const sql = `
      SELECT id, startDate, endDate, userId, createdAt, updatedAt
      FROM intervals
      WHERE userId = ?
      ORDER BY startDate DESC
      LIMIT ${parseInt(skip, 10)}, ${parseInt(limit, 10)}
    `;

    return await db.query(sql, [userId]);
  }

  /**
   * Conta tutti gli intervalli di un utente
   * @param {number} userId
   * @returns {Promise<number>}
   */
  static async countByUserId(userId) {
    const sql = `
      SELECT COUNT(*) AS total
      FROM intervals
      WHERE userId = ?
    `;

    const result = await db.query(sql, [userId]);
    return result[0].total;
  }

  /**
   * Trova intervalli attivi nella data specificata
   * @param {string} date
   * @param {number} [userId]
   * @returns {Promise<Array>}
   */
  static async findActiveByDate(date, userId = null) {
    let sql = `
      SELECT id, startDate, endDate, userId, createdAt, updatedAt
      FROM intervals
      WHERE ? BETWEEN startDate AND endDate
    `;

    const values = [date];

    if (userId) {
      sql += ` AND userId = ?`;
      values.push(userId);
    }

    sql += ` ORDER BY startDate DESC`;

    return await db.query(sql, values);
  }

  /**
   * Aggiunge un obiettivo all'intervallo
   * @param {number} intervalId
   * @param {number} goalId
   * @returns {Promise<Object>}
   */
  static async addGoal(intervalId, goalId) {
    const sql = `
      INSERT INTO interval_goals (intervalId, goalId)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE intervalId = VALUES(intervalId)
    `;

    return await db.query(sql, [intervalId, goalId]);
  }

  /**
   * Rimuove un obiettivo dall'intervallo
   * @param {number} intervalId
   * @param {number} goalId
   * @returns {Promise<boolean>}
   */
  static async removeGoal(intervalId, goalId) {
    const sql = `
      DELETE FROM interval_goals
      WHERE intervalId = ? AND goalId = ?
    `;

    const result = await db.query(sql, [intervalId, goalId]);

    return result.affectedRows > 0;
  }

  /**
   * Conta tutti gli obiettivi associati a un intervallo
   * @param {number} intervalId
   * @returns {Promise<number>}
   */
  static async countGoals(intervalId) {
    const sql = `
      SELECT COUNT(*) AS total
      FROM interval_goals
      WHERE intervalId = ?
    `;

    const result = await db.query(sql, [intervalId]);
    return result[0].total;
  }

  /**
   * Trova tutti gli obiettivi associati a un intervallo con supporto per paginazione
   * @param {number} intervalId
   * @param {Object} [options]
   * @param {number} [options.skip=0]
   * @param {number} [options.limit=10]
   * @returns {Promise<Array>}
   */
  static async getGoals(intervalId, { skip = 0, limit = 10 } = {}) {
    const sql = `
      SELECT g.id, g.name, g.description, g.createdAt, g.updatedAt, ig.id AS intervalGoalId
      FROM goals g
      JOIN interval_goals ig ON g.id = ig.goalId
      WHERE ig.intervalId = ?
      ORDER BY g.name
      LIMIT ${parseInt(skip, 10)}, ${parseInt(limit, 10)}
    `;

    return await db.query(sql, [intervalId]);
  }
}

module.exports = Interval;
