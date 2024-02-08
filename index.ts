import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await client.connect();
    await client.query(`
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`);
  } catch (e) {
    console.error(`Error executing query: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
})();

(async () => {
  try {
    await client.connect();
    await client.query(`CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    pincode VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`);
  } catch (e) {
    console.error(`Error in Creating Address Table: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
})();

/*
const insertUser = async (
  username: string,
  email: string,
  password: string,
) => {
  try {
    await client.connect();
    const query = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`; //Prevent SQL Injections
    const values = [username, email, password];
    const res = await client.query(query, values);
    console.log(`Successfully inserted data: ${res}`);
  } catch (e) {
    console.error(`Error in inserting data: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
};

const insertAddress = async (
  userId: number,
  city: string,
  country: string,
  street: string,
  pincode: string,
) => {
  try {
    await client.connect();
    const query = `INSERT INTO addresses (user_id, city, country, street, pincode) VALUES ($1, $2, $3, $4, $5)`;
    const values = [userId, city, country, street, pincode];
    const res = await client.query(query, values);
    console.log(`Successfully inserted address: ${res}`);
  } catch (e) {
    console.error(`Error in inserting address: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
};

const getUser = async (email: string) => {
  try {
    await client.connect();
    const query = `SELECT * FROM users email = $1`;
    const values = [email];
    const result = await client.query(query, values);
    return result.rows.length > 0
      ? (console.log("User found:", result.rows[0]), result.rows[0])
      : (console.log("No user found with the given email."), null);
  } catch (e) {
    console.error(`Error in fetching data: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
};

const getAddress = async (userId: number) => {
  try {
    await client.connect();
    const query = `SELECT * FROM addresses WHERE user_id = $1`;
    const values = [userId];
    const result = await client.query(query, values);
    return result.rows.length > 0
      ? (console.log("Address found:", result.rows[0]), result.rows[0])
      : (console.log("No address found with the given user ID."), null);
  } catch (e) {
    console.error(`Error in fetching address: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
};
*/

const insertData = async (
  username: string,
  email: string,
  password: string,
  city: string,
  country: string,
  street: string,
  pincode: string,
) => {
  try {
    await client.connect();
    await client.query(`BEGIN;`);
    const userQuery = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id;`;
    const userValues = [username, email, password];
    const userRes = await client.query(userQuery, userValues);
    const userId = userRes.rows[0].id;
    const addressQuery = `INSERT INTO addresses (user_id, city, country, street, pincode) VALUES ($1, $2, $3, $4, $5)`;
    const values = [userId, city, country, street, pincode];
    const addressRes = await client.query(addressQuery, values);
    await client.query(`COMMIT;`);
    console.log(`Successfully inserted data: ${userRes}, ${addressRes}`);
  } catch (e) {
    console.error(`Error in inserting data: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
};

const getData = async (email: string) => {
  let user;
  let address;
  try {
    await client.connect();
    const userQuery = `SELECT * FROM users WHERE email = $1`;
    const userValues = [email];
    const userRes = await client.query(userQuery, userValues);
    user = userRes.rows.length > 0 ? userRes.rows[0] : null;
    if (user) {
      const addressQuery = `SELECT * FROM addresses WHERE user_id = $1`;
      const addressValues = [user.id];
      const addressRes = await client.query(addressQuery, addressValues);
      address = addressRes.rows.length > 0 ? addressRes.rows[0] : null;
    }
    console.log(`Successfully fetched data: ${user}, ${address}`);
    return { user, address };
  } catch (e) {
    console.error(`Error in fetching data: ${e}`);
    throw e;
  } finally {
    await client.end();
  }
};
