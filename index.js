import {
  welcomeServer,
  listJob,
  creatJob,
  listUser,
  createUser,
  notFound,
  login,
} from "./helper";

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/" && request.method === "GET") {
      return welcomeServer();
    } else if (path === "/login" && request.method === "POST") {
      return await login(request);
    } else if (path === "/jobs" && request.method === "GET") {
      return listJob(request);
    } else if (path === "/jobs" && request.method === "POST") {
      return creatJob(request);
    } else if (path === "/users" && request.method === "GET") {
      return listUser(request);
    } else if (path === "/users" && request.method === "POST") {
      return createUser(request);
    }
    return notFound();
  },
});

console.log(`Listening on localhost:${server.port}`);
