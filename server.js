import Fastify from 'fastify';
import dotenv from 'dotenv';

import dbPlugin from './plugins/db.js';
import movieRoutes from './routes/movies/index.js';

//Laddar miljövariabler från .env-filen.
//Detta gör att applikationen blir enkel att konfigurera i både
//utvecklingsmiljö och produktion

dotenv.config();

//Skapar en ny fastify-instans
const fastify = Fastify({
  logger: true //gör att fastify loggar inkommande requests (bra för utveckling och felsökning)
});

//Registrerar Postgres-pluginet. 
//Detta plugin skapar en gemensam databas-anslutning (fastify.pg) som kan användas av controllers & modeller
fastify.register(dbPlugin);

//en enkel root-route som används för att verifiera att API:t körs.
fastify.get('/', async () => {
  return { message: 'Horror movies API is running' };
});

// Registrera alla /movies-routes
fastify.register(movieRoutes, { prefix: '/movies' });

/**
 * Funktion som startar servern
 * - PORT tas från .env eller faller tillbaka till 3000
 * - host: '0.0.0.0' gör API:t tillgänglig utanför datorn,
 * vilket krävs för att kunna deploya till publik webbhost
 * 
 * - fastify-listen() startar HTTP-servern
 * - fel fångas i catch och loggas med fastify.log.error()
 */
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1); //Avsluta om serverstart misslyckades
  }
};

//startar servern
start();
