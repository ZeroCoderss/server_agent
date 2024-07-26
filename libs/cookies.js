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

const getBody = async (request) => {
  const contentType = request.headers.get("Content-Type");
  let body = {};

  try {
    if (contentType && contentType.includes("application/json")) {
      // Parse JSON body
      body = await request.json();
    } else {
      // Read text body
      body = await request.text();
    }
  } catch (e) {
    console.log(e);
  }

  return body;
};

const getClientIp = (request) => {
  const xForwardedFor = request.headers.get("X-Forwarded-For");
  const xRealIp = request.headers.get("X-Real-IP");

  if (xForwardedFor) {
    // The `X-Forwarded-For` header can contain multiple IP addresses separated by commas
    // The first IP address is usually the client’s IP
    return xForwardedFor.split(",")[0].trim();
  } else if (xRealIp) {
    return xRealIp.trim();
  }

  // Fallback, if needed (e.g., for local testing)
  return "0.0.0.0";
};

export { parseCookies, createResponseWithCookie, getBody, getClientIp };
