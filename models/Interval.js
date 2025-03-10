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
   * Trova tutti gli intervalli
   * @param {Object} [filters]
   * @param {number} [filters.userId]
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT id, startDate, endDate, userId, createdAt, updatedAt
      FROM intervals
    `;

    const conditions = [];
    const values = [];

    if (filters.userId) {
      conditions.push("userId = ?");
      values.push(filters.userId);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY startDate DESC`;

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
   * Trova tutti gli intervalli di un utente
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  static async findByUserId(userId) {
    return this.findAll({ userId });
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
   * Trova tutti gli obiettivi associati a un intervallo
   * @param {number} intervalId
   * @returns {Promise<Array>}
   */
  static async getGoals(intervalId) {
    const sql = `
      SELECT g.id, g.name, g.description, g.createdAt, g.updatedAt, ig.id AS intervalGoalId
      FROM goals g
      JOIN interval_goals ig ON g.id = ig.goalId
      WHERE ig.intervalId = ?
      ORDER BY g.name
    `;

    return await db.query(sql, [intervalId]);
  }
}

module.exports = Interval;
