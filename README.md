📘 Horror Movies API – Fastify + PostgreSQL

En REST-baserad webbtjänst byggd med Fastify, Node.js och PostgreSQL.
Projektet uppfyller kraven för CRUD-hantering, datavalidering, databaslagring och korrekt route-struktur enligt Fastifys rekommendationer.

Webbtjänsten hanterar skräckfilmer och låter dig skapa, läsa, uppdatera och radera filmer via ett JSON-baserat API.

📦 Funktionalitet

✔ Full CRUD: Create, Read, Update, Delete
✔ Databasanslutning via PostgreSQL
✔ Automatiskt skapande av tabell vid serverstart
✔ Validering av inkommande data med Fastify JSON Schemas
✔ Strukturerad kod med controllers, models, plugins och routes
✔ API-svar i ren JSON
✔ Loggning aktiverad för enkel felsökning

🏗 Teknisk översikt

Projektet använder:

Fastify – backend-ramverket

@fastify/postgres – databasplugin

PostgreSQL – databasserver (körs via Docker)

dotenv – läser konfigurationsvariabler

Node.js (ES Modules)

📂 Projektstruktur
.
├── controllers/
│   └── moviesController.js
├── models/
│   └── movieModel.js
├── plugins/
│   └── db.js
├── routes/
│   └── movies/
│       └── index.js
├── .env
├── server.js
├── package.json
└── README.md

🗄 Databas
Tabell: movies

Tabellen skapas automatiskt vid serverstart via plugins/db.js.

Kolumn	Typ	Beskrivning
id	SERIAL PRIMARY KEY	Unikt ID för film
title	TEXT NOT NULL	Filmtitel
rating	NUMERIC(3,1) NOT NULL	Betyg (0–10)
is_scary	BOOLEAN NOT NULL	Om filmen är läskig eller inte
⚙ Installation & körning
1. Installera beroenden
npm install

2. Starta PostgreSQL via Docker
docker run --name horror-postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres

3. Skapa .env-fil
DATABASE_URL=postgres://postgres:password@localhost:5432/horror_movies
PORT=3000

4. Starta servern
npm start


Servern körs på:

http://localhost:3000

🔌 Endpoints (CRUD)

Alla filmer administreras via:
/movies

📍 GET /movies

Hämtar alla filmer.

Exempelrespons:

[
  {
    "id": 1,
    "title": "The Conjuring",
    "rating": 7.5,
    "isScary": true
  }
]

📍 GET /movies/:id

Hämtar en film med ett specifikt ID.

404-exempel:

{ "error": "Movie not found" }

📍 POST /movies

Skapar en ny film.

Body (JSON):

{
  "title": "The Ring",
  "rating": 8.2,
  "isScary": true
}


Svar:

{
  "id": 2,
  "title": "The Ring",
  "rating": 8.2,
  "isScary": true
}

📍 PUT /movies/:id

Uppdaterar en film.

Body (JSON):

{
  "title": "Hereditary",
  "rating": 8.3,
  "isScary": true
}


404-exempel:

{ "error": "Movie not found" }

📍 DELETE /movies/:id

Raderar en film.

Vid lyckad radering → HTTP 204 (ingen body).

404-exempel:

{ "error": "Movie not found" }

🔍 Validering

Alla inkommande requests valideras automatiskt av Fastify via JSON Schema:

movieParamsSchema – kontrollerar t.ex. att id är ett heltal

movieBodySchema – kräver:

title (string, min 1 tecken)

rating (nummer 0–10)

isScary (boolean)

Om valideringen misslyckas returneras 400 Bad Request med tydligt felmeddelande