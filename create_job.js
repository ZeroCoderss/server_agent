import { writeDb } from "./db/index";

const createQuery = writeDb.query(
  `INSERT INTO jobs (type, data, create_by, ip_add) VALUES ($type, $data, $create_by, $ip_add )`,
);

createQuery.run({
  $type: "today",
  $data: JSON.stringify({ run: "python opps.py" }),
  $create_by: "1",
  $ip_add: "1.1.1.1",
});
