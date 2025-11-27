// Modellklass som ansvarar för all kommunikation med PostGreSQL-databasen
// Alla SQL-frågor som rör "movies"-tabellen kapslas in här för att hålla
// koden organiserad och separerad från controllers och routes

export default class MovieModel {

    /**
     * Konstruktorn tar emot Fastifys PostgreSQL-klient (fastify.pg),
     * som skickas in från controllern
     * 
     * this.pg.query() används för att köra SQL-frågor mot databasen
     */
  constructor(pg) {
    this.pg = pg;
  }

  /**
  * Hämtar alla filmer från databasen
  * 
  * -ORDER BY id gör att filmer returneras i den ordning de skapades
  * -rows är en array med databasrader
  * -map() används för att konvertera varje rad till ett JavaScript-objekt
  * med mer användarvänliga nycklar
  */
  async getAll() {
    const { rows } = await this.pg.query(
      'SELECT id, title, rating, is_scary FROM movies ORDER BY id'
    );
    return rows.map(this._mapRowToMovie);
  }

  /**
   * Hämtar en specifik film baserat på id
   * -$1 i syfte att undvika SQL injections
   * - om ingen rad hittas returneras null (hanteras i controllern)
   */
  async getById(id) {
    const { rows } = await this.pg.query(
      'SELECT id, title, rating, is_scary FROM movies WHERE id = $1',
      [id]
    );
    return rows[0] ? this._mapRowToMovie(rows[0]) : null;
  }

  /**
   * Skapar en ny film i databasen
   * - RETURNING gör att PostgreSQL skickar tillbaka den nya raden direkt,
   * så att API:t kan returnera den till klienten
   */
  async create({ title, rating, isScary }) {
    const { rows } = await this.pg.query(
      `INSERT INTO movies (title, rating, is_scary)
       VALUES ($1, $2, $3)
       RETURNING id, title, rating, is_scary`,
      [title, rating, isScary]
    );
    return this._mapRowToMovie(rows[0]);
  }

  /**
   * Uppdaterar en film i databasen baserad på id
   * - om RETURNING inte returnerar någon rad betyder det att filmen inte hittades
   */
  async update(id, { title, rating, isScary }) {
    const { rows } = await this.pg.query(
      `UPDATE movies
       SET title = $1, rating = $2, is_scary = $3
       WHERE id = $4
       RETURNING id, title, rating, is_scary`,
      [title, rating, isScary, id]
    );
    return rows[0] ? this._mapRowToMovie(rows[0]) : null;
  }

  /**
   * Raderar en film baserat på id
   * - rowCount anger hur många rader som faktiskt raderades
   * - returnerar true om något raderats, annars false
   */
  async delete(id) {
    const { rowCount } = await this.pg.query(
      'DELETE FROM movies WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  /**
   * Hjälpmetod som omvandlar en rad från databasen
   * till ett objekt som är enklare att använda i resten av API:t
   * - PostgreSQL använder snake_case (is_scary)
   * - bygger om detta till camelCase för JS
   * - rating kastas till number eftersom PostgreSQL NUMERIC annars returneras
   * som string
   */
  _mapRowToMovie(row) {
    return {
      id: row.id,
      title: row.title,
      rating: Number(row.rating),
      isScary: row.is_scary
    };
  }
}
