import neo4j from 'neo4j-driver';
import {
  Country, Game, GameListing, User,
} from './models';

const driver = neo4j.driver('bolt://db:7687', neo4j.auth.basic(
  process.env.DB_USERNAME || 'neo4j', process.env.DB_PASSWORD || 'password',
));

export async function getNumNodes(): Promise<number> {
  const session = driver.session();
  const numNodes = await session.run('MATCH (n) RETURN n', {});
  return numNodes.records.length;
}

export async function createUser(
  user: User,
): Promise<boolean> {
  const session = driver.session();
  try {
    await session.run('CREATE (n:user {name: $name, surname: $surname, username: $username}) RETURN n', {
      name: user.name,
      surname: user.surname,
      username: user.username,
    });
    await session.run('CREATE CONSTRAINT IF NOT EXISTS ON (n:user) ASSERT n.username IS UNIQUE', {});
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function deleteUser(
  username: string,
): Promise<boolean> {
  const session = driver.session();
  try {
    await session.run(`
    MATCH (n {username: $username})
    DETACH DELETE n
    `, {
      username,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function updateUser(
  user: User,
  usernameOld: string,
): Promise<boolean> {
  const session = driver.session();
  try {
    await session.run(`
    MATCH (n {username: $usernameOld })
      SET n.username = $usernameNew, n.name = $name, n.surname = $surname
    RETURN n
    `, {
      usernameOld,
      usernameNew: user.username,
      name: user.name,
      surname: user.surname,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createCountry(
  country: Country,
): Promise<boolean> {
  const session = driver.session();
  try {
    await session.run('MERGE (n:country {country: $country, countryCode: $countryCode}) RETURN n', {
      country: country.country,
      countryCode: country.countryCode,
    });
    await session.run('CREATE CONSTRAINT IF NOT EXISTS ON (n:country) ASSERT n.country IS UNIQUE', {});

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createGame(
  game: Game, player: User,
): Promise<Game | null> {
  const session = driver.session();
  try {
    const createdGame = await session.run(`
    CREATE (newGame:game {score: $score, start: $start, end: $end})
    WITH newGame
    MATCH (a:user)
    WHERE a.username = $username
    CREATE (a)-[:SCORED]->(newGame)
    return newGame
    `, {
      score: game.score,
      start: game.start,
      end: game.end,
      username: player.username,
    });

    // console.log(createdGame.);
    return createdGame.records[0].get(0).properties;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function addUserToCounty(
  country: Country, player: User,
): Promise<boolean> {
  const session = driver.session();
  try {
    // Delete all previous vertexes with the given user and country
    await session.run(`
    MATCH (n {username: $username})-[r:LIVES_IN]->()
    DELETE r
    `, {
      username: player.username,
    });

    // Add user to the newly selected country
    await session.run(`
    MATCH (a:user), (b:country)
    WHERE a.username = $username AND b.country = $country
    CREATE (a)-[:LIVES_IN]->(b)
    return b
    `, {
      country: country.country,
      username: player.username,
    });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUsers(
  userPropertiesStartingNames: User,
): Promise<Array<User>> {
  const session = driver.session();
  try {
    const createdGame = await session.run(`
    MATCH (n: user)
    WHERE n.username STARTS WITH $username
    AND n.name STARTS WITH $name
    AND n.surname STARTS WITH $surname
    RETURN n
    `, {
      username: userPropertiesStartingNames.username,
      name: userPropertiesStartingNames.name,
      surname: userPropertiesStartingNames.surname,
    });
    console.log(JSON.stringify(createdGame.records));
    return createdGame.records.map((el) => el.get(0).properties);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getGames(
): Promise<Array<GameListing>> {
  const session = driver.session();
  try {
    const createdGame = await session.run(`
    MATCH (g: game)<-[p]-(u: user)-[l]->(c: country)
    RETURN g, u, c
    `, {});
    return createdGame.records.map(
      (el) => ({
        game: el.get(0).properties,
        user: el.get(1).properties,
        country: el.get(2).properties,
      }),
    );
  } catch (error) {
    console.log(error);
    return [];
  }
}

/* INITIAL DB SETUP */
export async function initial(): Promise<void> {
  const session = driver.session();
  // Country name is unique and users username is unique
  session.run('CREATE CONSTRAINT IF NOT EXISTS ON (n:user) ASSERT n.username IS UNIQUE', {});
  session.run('CREATE CONSTRAINT IF NOT EXISTS ON (n:country) ASSERT n.name IS UNIQUE', {});

  // Game has a "fake" primary key field
  session.run('CREATE CONSTRAINT IF NOT EXISTS ON (n:game) ASSERT n.pk IS UNIQUE', {});

  // NOTE: Checking if return false to not populate the server with too much
  // data as the server auto - reloads because of nodemon while developing

  // Insert temp data for user
  const u1 = { name: 'Roberts', surname: 'Ivanovs', username: 'ivn' };
  const u2 = { name: 'Dzintars', surname: 'Čīča', username: 'dzintars' };
  const u3 = { name: 'Viņķeles', surname: 'Kundze', username: 'disco' };
  const u4 = { name: 'Raimonds', surname: 'Pauls', username: 'vecadziesma' };
  const u5 = { name: 'Raimonds', surname: 'Pauls', username: 'jaunadziesma' };
  if (!await createUser(u1)) return;
  if (!await createUser(u2)) return;
  if (!await createUser(u3)) return;

  // Insert temp data for games
  const g1 = {
    score: 12,
    start: '2020-04-07 18:00:00',
    end: '2020-04-07 18:03:00',
  };
  const g2 = {
    score: 19,
    start: '2020-04-07 19:00:00',
    end: '2020-04-07 19:01:00',
  };
  const g3 = {
    score: 33,
    start: '1999-04-07 19:00:00',
    end: '1999-04-07 20:02:00',
  };
  const g4 = {
    score: 33,
    start: '2020-04-08 19:00:00',
    end: '2020-04-08 19:03:00',
  };
  const g5 = {
    score: 100,
    start: '2020-04-09 19:00:00',
    end: '2020-04-09 19:05:00',
  };
  const g6 = {
    score: 44,
    start: '2020-04-10 19:00:00',
    end: '2020-04-10 19:04:00',
  };

  // Create temp game data
  await createGame(g1, u1);
  await createGame(g2, u2);
  await createGame(g3, u3);
  await createGame(g4, u1);
  await createGame(g5, u1);
  await createGame(g6, u1);

  // Insert temp data for countries
  const c1 = { country: 'Latvia', countryCode: 'LV' };
  const c2 = { country: 'Lithuania', countryCode: 'LT' };
  const c3 = { country: 'Estonia', countryCode: 'EST' };

  if (!await createCountry(c1)) return;
  if (!await createCountry(c2)) return;
  if (!await createCountry(c3)) return;

  await addUserToCounty(c1, u1);
  await addUserToCounty(c2, u2);
  await addUserToCounty(c3, u3);
  await addUserToCounty(c1, u4);
  await addUserToCounty(c2, u5);
}
