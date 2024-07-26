import { Database } from "bun:sqlite";

// sqlite db read only
const readDb = new Database("./db/my_local.db", { readonly: true });
const writeDb = new Database("./db/my_local.db", { readwrite: true });

export { readDb, writeDb };
