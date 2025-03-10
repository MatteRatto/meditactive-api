const db = require("../config/database");

class User {
  /**
   * Crea un nuovo utente
   * @param {Object} userData - Dati dell'utente
   * @param {string} userData.email - Email dell'utente
   * @param {string} userData.firstName - Nome dell'utente
   * @param {string} userData.lastName - Cognome dell'utente
   * @returns {Promise<Object>} - Utente creato
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
   * @param {number} id - ID dell'utente
   * @returns {Promise<Object|null>} - Utente trovato o null
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
   * Trova tutti gli utenti
   * @returns {Promise<Array>}
   */
  static async findAll() {
    const sql = `
      SELECT id, email, firstName, lastName, createdAt, updatedAt
      FROM users
      ORDER BY lastName, firstName
    `;

    return await db.query(sql);
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
