import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';

/**
 * Fastify-plugin som ansvarar för att:
 * koppla upp fastify mot PostgreSQL-databasen och
 * se till att tabellen "movies" finns när servern startar
 * 
 * Plugins i Fastify gör det möjilgt att dela funktionalitet
 * över hela applikationen på ett organiserat och kontrollerat
 * sätt
 */

async function dbPlugin(fastify, options) {
  /** 
   * Registrera @fastify/Postgres-pluginet för att få
   * fastify.pg (delad databas-klient som alla controllers och models kan använda)
   * connectionString hämtas från .env (DATABASE_URL), och faller tillbaka
   * på en standard URL om variabeln inte finns. Det gör att databasen 
   * fungerar lokalt och i produktion
   */
  fastify.register(fastifyPostgres, {
    connectionString:
      process.env.DATABASE_URL ||
      'postgres://postgres:password@localhost:5432/horror_movies'
  });

  /**
   * När servern är redo att starta ("onReady"), körs denna hook
   * Den används för att skapa tabellen "movies" om den inte redan ginns
   * Applikationen funkar därför direkt utan manuell SQL-setup
   * 
   * fastify.pg.connect() ger en databas-connection om måste användas
   * för SQL-frågor och sedan släppas med client.release()
   */
  fastify.addHook('onReady', async () => {
    //Öppna en databas-connection
    const client = await fastify.pg.connect();
    try {
        //Skapa tabell om den inte redan finns
      await client.query(`
        CREATE TABLE IF NOT EXISTS movies (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          rating NUMERIC(3,1) NOT NULL,
          is_scary BOOLEAN NOT NULL
        );
      `);
    } finally {
        //Släpp connection tillbaka till poolen
      client.release();
    }
  });
}

/**
 * Exporterar pluginet som ett Fastify-plugin via fastify-plugin (fp) för att
 * fastify-plugin ser till att pluginet laddas i rätt ordning, andra plugins
 * och routes kan bero på det samt att fastify känner igen det som ett plugin
 */
export default fp(dbPlugin);
