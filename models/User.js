const db = require("../config/database");

class User {
  /**
   * Crea un nuovo utente
   * @param {Object} userData
   * @param {string} userData.email
   * @param {string} userData.firstName
   * @param {string} userData.lastName
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    const { email, firstName, lastName } = userData;

    const sql = `
      INSERT INTO users (email, firstName, lastName)
      VALUES (?, ?, ?)
    `;

    const result = await db.query(sql, [email, firstName, lastName]);

    return {
      id: result.insertId,
      email,
      firstName,
      lastName,
    };
  }

  /**
   * Trova un utente per ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT id, email, firstName, lastName, createdAt, updatedAt
      FROM users
      WHERE id = ?
    `;

    const users = await db.query(sql, [id]);

    return users.length ? users[0] : null;
  }

  /**
   * Trova un utente per email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, email, firstName, lastName, createdAt, updatedAt
      FROM users
      WHERE email = ?
    `;

    const users = await db.query(sql, [email]);

    return users.length ? users[0] : null;
  }

  /**
   * Conta tutti gli utenti che corrispondono ai filtri
   * @param {Object} [filters]
   * @returns {Promise<number>}
   */
  static async count(filters = {}) {
    let sql = `
      SELECT COUNT(*) AS total
      FROM users
    `;

    const conditions = [];
    const values = [];

    if (filters.email) {
      conditions.push("email LIKE ?");
      values.push(`%${filters.email}%`);
    }

    if (filters.firstName) {
      conditions.push("firstName LIKE ?");
      values.push(`%${filters.firstName}%`);
    }

    if (filters.lastName) {
      conditions.push("lastName LIKE ?");
      values.push(`%${filters.lastName}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    const result = await db.query(sql, values);
    return result[0].total;
  }

  /**
   * Trova tutti gli utenti con supporto per paginazione
   * @param {Object} [options]
   * @param {number} [options.skip=0]
   * @param {number} [options.limit=10]
   * @param {Object} [options.filters]
   * @returns {Promise<Array>}
   */
  static async findAll({ skip = 0, limit = 10, ...filters } = {}) {
    let sql = `
    SELECT id, email, firstName, lastName, createdAt, updatedAt
    FROM users
  `;

    const conditions = [];
    const values = [];

    if (filters.email) {
      conditions.push("email LIKE ?");
      values.push(`%${filters.email}%`);
    }

    if (filters.firstName) {
      conditions.push("firstName LIKE ?");
      values.push(`%${filters.firstName}%`);
    }

    if (filters.lastName) {
      conditions.push("lastName LIKE ?");
      values.push(`%${filters.lastName}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY lastName, firstName`;

    sql += ` LIMIT ${parseInt(skip, 10)}, ${parseInt(limit, 10)}`;

    return await db.query(sql, values);
  }

  /**
   * Aggiorna un utente
   * @param {number} id
   * @param {Object} userData
   * @returns {Promise<Object|null>}
   */
  static async update(id, userData) {
    const { email, firstName, lastName } = userData;

    const updateFields = [];
    const values = [];

    if (email !== undefined) {
      updateFields.push("email = ?");
      values.push(email);
    }

    if (firstName !== undefined) {
      updateFields.push("firstName = ?");
      values.push(firstName);
    }

    if (lastName !== undefined) {
      updateFields.push("lastName = ?");
      values.push(lastName);
    }

    if (updateFields.length === 0) {
      return null;
    }

    values.push(id);

    const sql = `
      UPDATE users
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
   * Elimina un utente
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const sql = `
      DELETE FROM users
      WHERE id = ?
    `;

    const result = await db.query(sql, [id]);

    return result.affectedRows > 0;
  }
}

module.exports = User;
