const ROLE_PERMISSIONS = {
  admin: ["read", "write", "manage-users", "view-reports"],
  editor: ["read", "write", "view-reports"],
  viewer: ["read"]
};

function toBase64(value) {
  return btoa(value);
}

function fromBase64(value) {
  return atob(value);
}

export function makeMockToken({ username, role }) {
  const header = toBase64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64(
    JSON.stringify({
      username,
      role,
      iat: Date.now()
    })
  );
  const signature = "mock-signature";
  return `${header}.${payload}.${signature}`;
}

export function decodeToken(token) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(fromBase64(parts[1]));
  } catch (error) {
    return null;
  }
}

export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] ?? [];
}
