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
   * @param {number} id - ID dell'obiettivo
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
   * Trova tutti gli obiettivi
   * @returns {Promise<Array>}
   */
  static async findAll() {
    const sql = `
      SELECT id, name, description, createdAt, updatedAt
      FROM goals
      ORDER BY name
    `;

    return await db.query(sql);
  }

  /**
   * Aggiorna un obiettivo
   * @param {number} id - ID dell'obiettivo
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
   * @param {number} id - ID dell'obiettivo
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
}

module.exports = Goal;
