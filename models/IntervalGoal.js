const db = require("../config/database");

class IntervalGoal {
  /**
   * Crea una nuova associazione tra intervallo e obiettivo
   * @param {Object} data
   * @param {number} data.intervalId
   * @param {number} data.goalId
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const { intervalId, goalId } = data;

    const sql = `
      INSERT INTO interval_goals (intervalId, goalId)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE createdAt = CURRENT_TIMESTAMP
    `;

    const result = await db.query(sql, [intervalId, goalId]);

    return {
      id:
        result.insertId || result.insertId === 0
          ? result.insertId
          : await this.getId(intervalId, goalId),
      intervalId,
      goalId,
    };
  }

  /**
   * Trova l'ID dell'associazione tra intervallo e obiettivo
   * @param {number} intervalId
   * @param {number} goalId
   * @returns {Promise<number|null>}
   */
  static async getId(intervalId, goalId) {
    const sql = `
      SELECT id
      FROM interval_goals
      WHERE intervalId = ? AND goalId = ?
    `;

    const results = await db.query(sql, [intervalId, goalId]);
    return results.length ? results[0].id : null;
  }

  /**
   * Trova un'associazione per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT id, intervalId, goalId, createdAt
      FROM interval_goals
      WHERE id = ?
    `;

    const results = await db.query(sql, [id]);
    return results.length ? results[0] : null;
  }

  /**
   * Trova tutte le associazioni per un intervallo
   * @param {number} intervalId
   * @returns {Promise<Array>}
   */
  static async findByIntervalId(intervalId) {
    const sql = `
      SELECT ig.id, ig.intervalId, ig.goalId, ig.createdAt,
             g.name AS goalName, g.description AS goalDescription
      FROM interval_goals ig
      JOIN goals g ON ig.goalId = g.id
      WHERE ig.intervalId = ?
      ORDER BY g.name
    `;

    return await db.query(sql, [intervalId]);
  }

  /**
   * Trova tutte le associazioni per un obiettivo
   * @param {number} goalId
   * @returns {Promise<Array>}
   */
  static async findByGoalId(goalId) {
    const sql = `
      SELECT ig.id, ig.intervalId, ig.goalId, ig.createdAt,
             i.startDate, i.endDate, i.userId
      FROM interval_goals ig
      JOIN intervals i ON ig.intervalId = i.id
      WHERE ig.goalId = ?
      ORDER BY i.startDate DESC
    `;

    return await db.query(sql, [goalId]);
  }

  /**
   * Verifica se esiste un'associazione tra intervallo e obiettivo
   * @param {number} intervalId
   * @param {number} goalId
   * @returns {Promise<boolean>}
   */
  static async exists(intervalId, goalId) {
    const sql = `
      SELECT COUNT(*) AS count
      FROM interval_goals
      WHERE intervalId = ? AND goalId = ?
    `;

    const results = await db.query(sql, [intervalId, goalId]);
    return results[0].count > 0;
  }

  /**
   * Elimina un'associazione
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const sql = `
      DELETE FROM interval_goals
      WHERE id = ?
    `;

    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Elimina un'associazione per intervallo e obiettivo
   * @param {number} intervalId
   * @param {number} goalId
   * @returns {Promise<boolean>}
   */
  static async deleteByIntervalAndGoal(intervalId, goalId) {
    const sql = `
      DELETE FROM interval_goals
      WHERE intervalId = ? AND goalId = ?
    `;

    const result = await db.query(sql, [intervalId, goalId]);
    return result.affectedRows > 0;
  }

  /**
   * Elimina tutte le associazioni per un intervallo
   * @param {number} intervalId
   * @returns {Promise<number>}
   */
  static async deleteByIntervalId(intervalId) {
    const sql = `
      DELETE FROM interval_goals
      WHERE intervalId = ?
    `;

    const result = await db.query(sql, [intervalId]);
    return result.affectedRows;
  }

  /**
   * Elimina tutte le associazioni per un obiettivo
   * @param {number} goalId
   * @returns {Promise<number>}
   */
  static async deleteByGoalId(goalId) {
    const sql = `
      DELETE FROM interval_goals
      WHERE goalId = ?
    `;

    const result = await db.query(sql, [goalId]);
    return result.affectedRows;
  }

  /**
   * Associa un obiettivo a un intervallo
   * @param {number} intervalId
   * @param {number} goalId
   * @returns {Promise<Object>}
   */
  static async associate(intervalId, goalId) {
    return await this.create({ intervalId, goalId });
  }
  /**
   * @param {number} userId
   * @param {string} [startDate]
   * @param {string} [endDate]
   * @returns {Promise<Array>}
   */
  static async getGoalStatsByUser(userId, startDate = null, endDate = null) {
    let sql = `
      SELECT g.id, g.name, COUNT(DISTINCT ig.intervalId) AS intervalCount
      FROM goals g
      JOIN interval_goals ig ON g.id = ig.goalId
      JOIN intervals i ON ig.intervalId = i.id
      WHERE i.userId = ?
    `;

    const params = [userId];

    if (startDate) {
      sql += ` AND i.endDate >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND i.startDate <= ?`;
      params.push(endDate);
    }

    sql += `
      GROUP BY g.id
      ORDER BY intervalCount DESC, g.name
    `;

    return await db.query(sql, params);
  }
}
IntervalGoal.dissociate = IntervalGoal.deleteByIntervalAndGoal;

module.exports = IntervalGoal;
