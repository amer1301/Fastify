import createMoviesController from '../../controllers/moviesController.js';

/**
 * Schema för route-parametrar.
 * Används för validering av t.ex. /movies/:id.
 * Fastify använder JSON Schema för att automatiskt validera
 * inkommande data och returnera tydliga felmeddelanden, såsom 
 * 400 bad request
 */
const movieParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 } //id måste vara ett positivt heltal
  },
  required: ['id']
};

/**
 * Schema för request body vid POST och PUT
 * säkerställer att klienten skickar korrekt data
 * innan kontrollen körs
 * 
 * additionalProperties: false -> förhindrar okända fält
 */
const movieBodySchema = {
  type: 'object',
  required: ['title', 'rating', 'isScary'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1 },
    rating: { type: 'number', minimum: 0, maximum: 10 },
    isScary: { type: 'boolean' }
  }
};

/**
 * Schema för hur en film ska se ut i API-svaret.
 * Används i fastifys auto-genererade dokumentation
 * och säkerställer konsekventa responser
 */
const movieResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    rating: { type: 'number' },
    isScary: { type: 'boolean' }
  }
};

/**
 * Registrerar alla routes för /movies.
 * Varje route använder JSON-schema för 
 * validering, anropar en passande controller-metod 
 * samt specificerar vilka responses som returneras
 */
export default async function movieRoutes(fastify, options) {
    //skapar controllers som innehåller all logik för CRUD-operationer
  const controller = createMoviesController(fastify);

  /**
   * GET /movies - hämtar alla filmer
   * Response: array av filmobjekt
   */
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: movieResponseSchema
        }
      }
    }
  }, controller.getAll);

  /**
   * GET /movies/:id
   * Hämtar en specifik film baserat på dess id och
   * validerar att params.id är ett positivt heltal.
   */
  fastify.get('/:id', {
    schema: {
      params: movieParamsSchema,
      response: {
        200: movieResponseSchema,
        404: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, controller.getOne);

  /**
   * POST /movies
   * skapar en ny film.
   * body måste matcha movieBodySchema.
   * returnerar 201 created med den nya filmen om allt är ok
   */
  fastify.post('/', {
    schema: {
      body: movieBodySchema,
      response: {
        201: movieResponseSchema
      }
    }
  }, controller.create);

  /**
   * PUT /movies/:id
   * Uppdaterar en befintlig film.
   * Validerar både id och request body.
   * Returnerar 404 om filmen inte hittades
   */
  fastify.put('/:id', {
    schema: {
      params: movieParamsSchema,
      body: movieBodySchema,
      response: {
        200: movieResponseSchema,
        404: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, controller.update);

  /**
   * DELETE /movies/:id
   * Raderar en film
   * returnerar 204 no content om raderingen lyckades
   */
  fastify.delete('/:id', {
    schema: {
      params: movieParamsSchema,
      response: {
        204: { type: 'null' }, //204 har inget body-svar
        404: {
          type: 'object',
          properties: { error: { type: 'string' } }
        }
      }
    }
  }, controller.remove);
}
