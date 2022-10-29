const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const movies = `
    SELECT
      *
    FROM
      movie`;
  const movieArray = await db.all(movies);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movie = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (${directorId},'${movieName}','${leadActor}');`;
  const movieArray = await db.run(movie);
  response.send("Movie Successfully Added");
});

//
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery1 = `
    SELECT
      *
    FROM
      movie
    WHERE 
    movie_id=${movieId};`;
  const movieData2 = await db.get(movieQuery1);
  response.send(convertDbObjectToResponseObject1(movieData2));
});

//
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const movieQuery = `
    UPDATE
    movie
    SET
    movie_name = '${movieName}',
    director_id = ${directorId},
    lead_actor = '${leadActor}'
    WHERE movie_id=${movieId}`;
  const movieData = await db.run(movieQuery);
  response.send("Movie Details Updated");
});

//
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery2 = `
    DELETE FROM
    movie
    WHERE 
    movie_id=${movieId}`;
  const movieData3 = await db.run(movieQuery2);
  response.send("Movie Removed");
});

//
app.get("/directors/", async (request, response) => {
  const directors = `
    SELECT
      *
    FROM
      director`;
  const directorArray = await db.all(directors);
  response.send(
    directorArray.map((eachMovie) =>
      convertDbObjectToResponseObject2(eachMovie)
    )
  );
});

//
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const movies = `
    SELECT
      *
    FROM
      movie
      WHERE
      director_id = ${directorId}
      `;
  const moviesArray = await db.all(movies);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
