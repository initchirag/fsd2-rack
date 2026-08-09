import { createContext, useContext, useMemo, useState } from "react";
import { decodeToken, getRolePermissions, makeMockToken } from "../utils/token";

const TOKEN_KEY = "exp-auth-token";
const AuthContext = createContext(null);

function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return { token: null, user: null };
  }

  const payload = decodeToken(token);
  if (!payload) {
    localStorage.removeItem(TOKEN_KEY);
    return { token: null, user: null };
  }

  return {
    token,
    user: {
      username: payload.username,
      role: payload.role,
      permissions: getRolePermissions(payload.role)
    }
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());

  const login = (username, password, role) => {
    const validPassword = "1234";
    if (!username || password !== validPassword || !role) {
      throw new Error("Invalid credentials. Use password: 1234");
    }

    const token = makeMockToken({ username, role });
    const nextSession = {
      token,
      user: {
        username,
        role,
        permissions: getRolePermissions(role)
      }
    };

    localStorage.setItem(TOKEN_KEY, token);
    setSession(nextSession);
    return nextSession;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setSession({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token),
      login,
      logout
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
