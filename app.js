const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM player_details;`;
  const players = await db.all(getPlayersQuery);
  response.send(
    players.map((player) => ({
      playerId: player.player_id,
      playerName: player.player_name,
    }))
  );
});

//GET player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send({
    playerId: player.player_id,
    playerName: player.player_name,
  });
});

//UPDATE player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const putPlayerQuery = `
    UPDATE player_details
    SET player_name = "${playerName}"
    WHERE player_id = ${player_id};`;
  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

//GET match API
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT * FROM match_details 
    WHERE match_id = ${matchId};`;
  const match = await db.get(getMatchQuery);
  response.send({
    matchId: match.match_id,
    match: match.match,
    year: match.year,
  });
});

//GET matches of player API
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const matchesOfPlayerQuery = `
    SELECT * FROM player_match_score
    NATURAL JOIN match_details
    WHERE player_id = ${playerId};`;
  const matches = await db.all(matchesOfPlayerQuery);
  response.send(
    matches.map((match) => ({
      matchId: match.match_id,
      match: match.match,
      year: match.year,
    }))
  );
});

//GET players of match API
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const playersOfMatchQuery = `
    SELECT * FROM player_match_score
    NATURAL JOIN player_details
    WHERE player_id = ${playerId};`;
  const players = await db.all(playersOfMatchQuery);
  response.send(
    players.map((player) => ({
      playerId: player.player_id,
      playerName: player.player_name,
    }))
  );
});

//GET statics of a player API
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const playerStatisticsQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM player_match_score
    NATURAL JOIN player_details
    WHERE player_id = ${playerId};`;
  const statisticsOfPlayer = await db.get(playerStatisticsQuery);
  response.send(statisticsOfPlayer);
});

module.exports = app;
