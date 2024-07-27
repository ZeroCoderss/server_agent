import { Database } from "bun:sqlite";

const db = new Database("./db/my_local.db", { readwrite: true });


const defaultUserQuery = db.query(
    `
  INSERT INTO users (email, name, role) VALUES ("agayen04@gmail.com", "Abhijit Gayen", "admin")
  `,
);

await defaultUserQuery.run();
