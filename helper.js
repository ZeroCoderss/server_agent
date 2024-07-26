import { readDb } from "./db";
import { createResponseWithCookie, parseCookies } from "./libs/cookies";

const jobs = [];
const users = [];

const welcomeServer = () => {
  return createResponseWithCookie(
    "Welcome to Bun Agent Server!",
    "token",
    "this is testing token",
  );
};

const listJob = (request) => {
  const cookieHeader = request.headers.get("Cookie");
  console.log(parseCookies(cookieHeader));
  const jobsQuery = readDb.query(`SELECT * FROM jobs`);
  const jobsData = jobsQuery.all();
  return new Response(JSON.stringify(jobsData), {
    headers: { "Content-Type": "application/json" },
  });
};

const creatJob = (request) => {
  return request.json().then((data) => {
    // todo need to add job data
    // jobs.push(data);
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });
};

const listUser = (request) => {
  const usersQuery = readDb.query(`SELECT * FROM users`);
  const usersData = usersQuery.all();

  return new Response(JSON.stringify(usersData), {
    headers: { "Content-Type": "application/json" },
  });
};

const createUser = (request) => {
  return request.json().then((data) => {
    // TODO: Need to add Data
    // users.push(data);
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });
};

const notFound = () => {
  return new Response("Sorry Not Found Page", { status: 404 });
};

export { welcomeServer, listJob, creatJob, listUser, createUser, notFound };
