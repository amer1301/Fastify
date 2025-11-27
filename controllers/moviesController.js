import MovieModel from '../models/movieModel.js';

/**
 * Controller-funktion som skapar och returnerar alla handlers
 * för /movies-routes
 * 
 * Fastify skickas in som argument så att det går att komma åt:
 * -fastify.pg -> databas-klienten från @fastify/postgres
 * -fastify.log -> loggning
 */
export default function createMoviesController(fastify) {
    //Skapar en instans av MovieModel och skickar in Fastifys databas-klient
    //Modellen ansvarar för all SQL-logik (SELECT, INSERT, UPDATE OCH DELETE)
    const model = new MovieModel(fastify.pg);

    return {
        /**
         * GET /movies
         * Hämtar alla filmer från databasen
         * 
         * request -> info om inkommande HTTP-request
         * reply -> används för att skicka svar (statuskoder, data)
         */
        getAll: async (request, reply) => {
            const movies = await model.getAll();
            return reply.send(movies); //Fastify skickar automatiskt JSON
        },

        /**
         * GET /movies/:id
         * Hämtar film baserat på dess id
         * 
         * id kommer från URL-parametern och nås via request.params
         */
        getOne: async (request, reply) => {
            const { id } = request.params;
            const movie = await model.getById(id);

            if (!movie) {
                return reply.code(404).send({ error: 'Movie not found' }); //Returnera fel 404 om ingen film hittas
            }

            return reply.send(movie);
        },

        /**
         * POST /movies
         * skapar ny film i databasen
         * 
         * request.body innehåller JSON-data som klienten skickar in
         * validering av body sker i routes via Fastifys schema
         */
        create: async (request, reply) => {
            const { title, rating, isScary } = request.body;
            const newMovie = await model.create({ title, rating, isScary }); //modellens create()-metod sköter SQL INSERT och returnerar den nya
            return reply.code(201).send(newMovie); //skicka statuskod 201 när en resurs skapas
        },

        /**
         * PUT /movies/:id
         * Uppdaterar en befintlig film med nytt innehåll
         * 
         * PUT ska enligt REST uppdatera hela objektet
         */
        update: async (request, reply) => {
            const { id } = request.params;
            const { title, rating, isScary } = request.body;

            const updatedMovie = await model.update(id, { title, rating, isScary }); //Returnerar null om ID inte finns

            if (!updatedMovie) {
                return reply.code(404).send({ error: 'Movie not found' }); //Felkod 404 om filmen inte hittas
            }

            return reply.send(updatedMovie);
        },

        /**
         * DELETE /movies/:id
         * Tar bort en film ur databasen
         * 
         * Modellens delete()-metod returnerar boolean baserade på
         * om en rad faktiskt togs bort eller inte (true/false)
         */
        remove: async (request, reply) => {
            const { id } = request.params;
            const deleted = await model.delete(id);

            if (!deleted) {
                return reply.code(404).send({ error: 'Movie not found' }); //ingen rad raderades
            }

            // 204 No Content, korrekt svar om något har raderats och ingen data returnerades
            return reply.code(204).send();
        }
    };
}
