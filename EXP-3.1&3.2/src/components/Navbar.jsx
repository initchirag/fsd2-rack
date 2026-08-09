import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="brand">
        <Link to="/">JWT + RBAC Lab</Link>
      </div>
      <nav className="menu">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/viewer">Viewer</NavLink>
            {(user.role === "admin" || user.role === "editor") && (
              <NavLink to="/editor">Editor</NavLink>
            )}
            {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
            <button className="ghost" onClick={logout} type="button">
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
