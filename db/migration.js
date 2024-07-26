import { Database } from "bun:sqlite";

const db = new Database("./db/my_local.db", { create: true });

const jobQuery = db.query(
  `
  CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      data TEXT,
      status TEXT DEFAULT 'pending',
      create_by TEXT NOT NULL,
      error TEXT,
      ip_add TEXT NOT NULL
    )
  `,
);

const userQuery = db.query(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  );
  `,
);

userQuery.run();
jobQuery.run();
