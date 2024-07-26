// Function to parse cookies from the `Cookie` header
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.split("=");
    cookies[name.trim()] = rest.join("=").trim();
    return cookies;
  }, {});
};

// Function to create a response with a cookie
const createResponseWithCookie = (
  message,
  cookieKey,
  cookieValue,
  maxAge = 3600,
  path = "/",
  httpOnly = true,
  secure = true,
  sameSite = "Strict",
) => {
  const headers = new Headers({
    "Content-Type": "text/plain",
    "Set-Cookie": `${cookieKey}=${cookieValue}; Max-Age=${maxAge}; Path=${path}; ${httpOnly ? "HttpOnly;" : ""} ${secure ? "Secure;" : ""} SameSite=${sameSite}`, // Setting a cookie
  });

  return new Response(message, {
    headers: headers,
  });
};

export { parseCookies, createResponseWithCookie };
