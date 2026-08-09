import { decodeToken } from "../utils/token";

export async function fetchUserProfile(authToken) {
  if (!authToken) {
    throw new Error("Missing auth token");
  }

  const payload = decodeToken(authToken);
  if (!payload) {
    throw new Error("Token is invalid or expired");
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    greeting: `Welcome ${payload.username}`,
    role: payload.role,
    tokenIssuedAt: new Date(payload.iat).toLocaleString()
  };
}
