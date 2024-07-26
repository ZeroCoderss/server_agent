import { readDb, writeDb } from "./db";
import {
  createResponseWithCookie,
  getBody,
  getClientIp,
  parseCookies,
} from "./libs/cookies";
import { decrypt, encrypt } from "./libs/crypto";

// Middleware function to handle authentication
const authenticate = (request, isAdminTest = false) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = parseCookies(cookieHeader);
  const ipAddr = getClientIp(request);

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

  if (!userData?.email || !userData?.role || !userData?.ip) {
    return new Response(
      JSON.stringify({ message: "ERR_UNVERIFIED_USER", status: false }),
      { status: 403 },
    );
  }

  if (userData?.ip !== ipAddr) {
    return new Response(
      JSON.stringify({ message: "ERR_EXPIRE_TOKEN", status: false }),
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

const userVerify = (userData) => {
  if (!userData.email) {
    return new Response(
      JSON.stringify({ message: "ERR_EMAIL_MISSING", status: false }),
      { status: 401 },
    );
  }

  const userQuery = readDb.query("SELECT * FROM users where email = $email");
  let data = [];

  try {
    data = userQuery.all({ $email: userData.email });
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "ERR_DB", error: e.message, status: false }),
      { status: 403 },
    );
  }

  if (data.length < 1) {
    return new Response(
      JSON.stringify({ message: "ERR_WRONG_EMAIL", status: false }),
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
    return new Response(
      JSON.stringify({ message: "ERR_EMAIL_REQUIRED", status: false }),
      { status: 401 },
    );
  }

  const userQuery = readDb.query("SELECT * FROM users where email = $email");

  let userData = [];

  try {
    userData = userQuery.all({ $email: body.email });
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "ERR_DB", error: e.message, status: false }),
      { status: 403 },
    );
  }

  if (userData.length < 1) {
    return new Response(
      JSON.stringify({ message: "ERR_WRONG_EMAIL", status: false }),
      { status: 403 },
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
  let jobsData = [];

  try {
    jobsData = jobsQuery.all();
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "ERR_DB", error: e.message, status: false }),
      { status: 403 },
    );
  }
  return new Response(JSON.stringify(jobsData), {
    headers: { "Content-Type": "application/json" },
  });
};

const creatJob = async (request) => {
  const authResult = authenticate(request);
  if (authResult instanceof Response) {
    return authResult; // Return the response from the middleware if there's an error
  }

  const verifyUser = userVerify(authResult.userData);
  if (verifyUser instanceof Response) {
    return verifyUser;
  }

  const body = await getBody(request);

  if (!body.type) {
    return new Response(
      JSON.stringify({ message: "ERR_JOB_TYPE_REQUIRED", status: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (!body.data) {
    return new Response(
      JSON.stringify({ message: "ERR_JOB_DATA_REQUIRED", status: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const userQuery = writeDb.query(
    "INSERT INTO jobs (type, data, create_by, ip_add) VALUES ($type, $data, $create_by, $ip_add)",
  );

  try {
    userQuery.run({
      $type: body.type,
      $data: body.data,
      $create_by: authResult?.userData?.email,
      $ip_add: authResult?.userData?.ip,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "ERR_DB", error: e.message, status: false }),
      { status: 403 },
    );
  }

  return new Response(JSON.stringify({ message: "Sucessful", status: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

const listUser = (request) => {
  const authResult = authenticate(request, true);
  if (authResult instanceof Response) {
    return authResult; // Return the response from the middleware if there's an error
  }

  const verifyUser = userVerify(authResult.userData);
  if (verifyUser instanceof Response) {
    return verifyUser;
  }

  const usersQuery = readDb.query(`SELECT * FROM users`);
  let usersData = [];

  try {
    usersData = usersQuery.all();
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "ERR_DB", error: e.message, status: false }),
      { status: 403 },
    );
  }

  return new Response(JSON.stringify(usersData), {
    headers: { "Content-Type": "application/json" },
  });
};

const createUser = async (request) => {
  const authResult = authenticate(request, true);
  if (authResult instanceof Response) {
    return authResult; // Return the response from the middleware if there's an error
  }

  const body = await getBody(request);

  if (!body.email) {
    return new Response(
      JSON.stringify({ message: "ERR_EMAIL_REQUIRED", status: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (!body.name) {
    return new Response(
      JSON.stringify({ message: "ERR_NAME_REQUIRED", status: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  if (!body.role) {
    return new Response(
      JSON.stringify({ message: "ERR_ROLE_REQUIRED", status: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const userQuery = writeDb.query(
    "INSERT INTO users (email, name, role) VALUES ($email, $name, $role)",
  );

  try {
    userQuery.run({
      $email: body.email,
      $name: body.name,
      $role: body.role,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "ERR_DB", error: e.message, status: false }),
      { status: 403 },
    );
  }

  return new Response(JSON.stringify({ message: "Sucessful", status: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
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
