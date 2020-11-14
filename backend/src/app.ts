import express from 'express';
import cors from 'cors';
import { createCountry, createGame, createUser, getNumNodes, initial } from './database';
import { Country, Game, User } from './models';

const app = express();
const port = 8000; // default port to listen

/*  ---------- start the Express server ---------- */
app.listen(port, () => {
  console.log(
    `server started at http://localhost:${port}`,
  );

  // Perform initial DB setup
  initial();
});

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

/* -----------  Neo4j encompassing endpoints ----------- */
app.get('/api/nodes', async (req, res) => {
  const nodeCount = await getNumNodes();
  res.send({ nodeCount });
});

app.post('/api/users', async (req, res) => {
  const obj: User = req.body;
  const created = await createUser(obj);
  res.send({ created });
  res.status(created ? 201 : 400);
});

app.post('/api/countries', async (req, res) => {
  const obj: Country = req.body;
  const created = await createCountry(obj);
  res.send({ created });
  res.status(created ? 201 : 400);
});

interface Params {
  game: Game,
  user: User
}
app.post('/api/games', async (req, res) => {
  const obj: Params = req.body;
  const created = await createGame(obj.game, obj.user);
  res.send({ created });
  res.status(created ? 201 : 400);
});
