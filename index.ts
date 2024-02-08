import { Client } from "pg";

const client = new Client({
  connectionString: `postgresql://arnnvv:byhY0MAEzS7a@ep-shiny-feather-20561110.us-east-2.aws.neon.tech/test?sslmode=require`,
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
