import {
  welcomeServer,
  listJob,
  creatJob,
  listUser,
  createUser,
  notFound,
  login,
} from "./helper";

// const APP_PATH = "./app";

const apiCallEndPoint = async (request, path) => {
  if (path === "/api/v1/login" && request.method === "POST") {
    return await login(request);
  } else if (path === "/api/v1/jobs" && request.method === "GET") {
    return listJob(request);
  } else if (path === "/api/v1/jobs" && request.method === "POST") {
    return await creatJob(request);
  } else if (path === "/api/v1/users" && request.method === "GET") {
    return listUser(request);
  } else if (path === "/api/v1/users" && request.method === "POST") {
    return await createUser(request);
  }

  return notFound();
};

const appRootEndPoint = async (request, path) => {
  if (path === "/") {
    return welcomeServer();
  }

  // } else if (path === "/bashboad") {
  //   return new Response(Bun.file(`${APP_PATH}/index.html`));
  // }

  return notFound();
};

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/v1/")) {
      return await apiCallEndPoint(request, path);
    } else {
      return await appRootEndPoint(request, path);
    }
  },
});

console.log(`Listening on localhost:${server.port}`);
