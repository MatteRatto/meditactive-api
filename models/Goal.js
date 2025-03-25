const db = require("../config/database");

class Goal {
  /**
   * Crea un nuovo obiettivo
   * @param {Object} goalData
   * @param {string} goalData.name
   * @param {string} [goalData.description]
   * @returns {Promise<Object>}
   */
  static async create(goalData) {
    const { name, description } = goalData;

    const sql = `
      INSERT INTO goals (name, description)
      VALUES (?, ?)
    `;

    const result = await db.query(sql, [name, description || null]);

    return {
      id: result.insertId,
      name,
      description,
    };
  }

  /**
   * Trova un obiettivo per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT id, name, description, createdAt, updatedAt
      FROM goals
      WHERE id = ?
    `;

    const goals = await db.query(sql, [id]);

    return goals.length ? goals[0] : null;
  }

  /**
   * Conta tutti gli obiettivi che corrispondono ai filtri
   * @param {Object} [filters]
   * @returns {Promise<number>}
   */
  static async count(filters = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM goals
    `;

    const conditions = [];
    const values = [];

    if (filters.name) {
      conditions.push("name LIKE ?");
      values.push(`%${filters.name}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await db.query(sql, values);
    return result[0].total;
  }

  /**
   * Trova tutti gli obiettivi con supporto per paginazione
   * @param {Object} [options]
   * @param {number} [options.skip=0]
   * @param {number} [options.limit=10]
   * @param {Object} [options.filters]
   * @returns {Promise<Array>}
   */
  static async findAll({ skip = 0, limit = 10, ...filters } = {}) {
    let sql = `
      SELECT id, name, description, createdAt, updatedAt
      FROM goals
    `;

    const conditions = [];
    const values = [];

    if (filters.name) {
      conditions.push("name LIKE ?");
      values.push(`%${filters.name}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY name`;
    sql += ` LIMIT ${parseInt(skip, 10)}, ${parseInt(limit, 10)}`;

    return await db.query(sql, values);
  }

  /**
   * Aggiorna un obiettivo
   * @param {number} id
   * @param {Object} goalData
   * @returns {Promise<Object|null>}
   */
  static async update(id, goalData) {
    const { name, description } = goalData;

    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      values.push(name);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      values.push(description);
    }

    if (updateFields.length === 0) {
      return null;
    }

    values.push(id);

    const sql = `
      UPDATE goals
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
   * Elimina un obiettivo
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const sql = `
      DELETE FROM goals
      WHERE id = ?
    `;

    const result = await db.query(sql, [id]);

    return result.affectedRows > 0;
  }

  /**
   * Trova tutti gli obiettivi associati a un intervallo
   * @param {number} intervalId
   * @returns {Promise<Array>}
   */
  static async findByIntervalId(intervalId) {
    const sql = `
      SELECT g.id, g.name, g.description, g.createdAt, g.updatedAt
      FROM goals g
      JOIN interval_goals ig ON g.id = ig.goalId
      WHERE ig.intervalId = ?
      ORDER BY g.name
    `;

    return await db.query(sql, [intervalId]);
  }

  /**
   * Trova tutti gli obiettivi di un utente (attraverso gli intervalli)
   * @param {number} userId
   * @param {Object} [options]
   * @param {number} [options.skip=0]
   * @param {number} [options.limit=10]
   * @returns {Promise<Array>}
   */
  static async findByUserId(userId, { skip = 0, limit = 10 } = {}) {
    const sql = `
      SELECT DISTINCT g.id, g.name, g.description, g.createdAt, g.updatedAt
      FROM goals g
      JOIN interval_goals ig ON g.id = ig.goalId
      JOIN intervals i ON ig.intervalId = i.id
      WHERE i.userId = ?
      ORDER BY g.name
      LIMIT ${parseInt(skip, 10)}, ${parseInt(limit, 10)}
    `;

    return await db.query(sql, [userId]);
  }

  /**
   * Conta tutti gli obiettivi di un utente
   * @param {number} userId
   * @returns {Promise<number>}
   */
  static async countByUserId(userId) {
    const sql = `
      SELECT COUNT(DISTINCT g.id) AS total
      FROM goals g
      JOIN interval_goals ig ON g.id = ig.goalId
      JOIN intervals i ON ig.intervalId = i.id
      WHERE i.userId = ?
    `;

    const result = await db.query(sql, [userId]);
    return result[0].total;
  }
}

module.exports = Goal;
