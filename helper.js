import { readDb } from "./db";
import {
  createResponseWithCookie,
  getBody,
  getClientIp,
  parseCookies,
} from "./libs/cookies";
import { decrypt, encrypt } from "./libs/crypto";

const jobs = [];
const users = [];

// Middleware function to handle authentication
const authenticate = (request, isAdminTest = false) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = parseCookies(cookieHeader);

  if (!cookies?.token) {
    return new Response(
      JSON.stringify({ message: "ERR_NOT_AUTHENTICATE", status: false }),
      { status: 401 },
    );
  }

  let userData = {};
  try {
    userData = JSON.parse(decrypt(cookies.token));
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "ERR_TOKEN_NOT_VERIFIED", status: false }),
      { status: 401 },
    );
  }

  if (!userData?.email || !userData?.role) {
    return new Response(
      JSON.stringify({ message: "ERR_UNVERIFIED_USER", status: false }),
      { status: 403 },
    );
  }

  if (isAdminTest && userData?.role !== "admin") {
    return new Response(
      JSON.stringify({ message: "ERR_ACCESS_DENIED", status: false }),
      { status: 403 },
    );
  }

  return { userData };
};

const welcomeServer = () => {
  return new Response("Welcome to Bun Agent Server!");
};

const login = async (request) => {
  const body = await getBody(request);
  const ipAddr = getClientIp(request);

  if (!body?.email) {
    return new Response("ERR_EMAIL_REQUIRED", { status: 404 });
  }

  const userQuery = readDb.query("SELECT * FROM users where email = $email");
  const userData = userQuery.all({ $email: body.email });

  if (userData.length < 1) {
    return new Response(
      JSON.stringify({ message: "ERR_WRONG_EMAIL", status: false }),
    );
  }

  const tokenData = {
    email: userData[0].email,
    id: userData[0].id,
    role: userData[0].role,
    ip: ipAddr,
  };

  const token = encrypt(JSON.stringify(tokenData));

  return createResponseWithCookie(
    JSON.stringify({ message: "Sucessful", status: true }),
    "token",
    token,
  );
};

const listJob = (request) => {
  const authResult = authenticate(request);
  if (authResult instanceof Response) {
    return authResult; // Return the response from the middleware if there's an error
  }

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
  const authResult = authenticate(request, true);
  if (authResult instanceof Response) {
    return authResult; // Return the response from the middleware if there's an error
  }

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

export {
  welcomeServer,
  listJob,
  creatJob,
  listUser,
  createUser,
  notFound,
  login,
};
