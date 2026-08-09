import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "viewer"
  });
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      login(form.username.trim(), form.password, form.role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="card">
      <h1>Login</h1>
      <p className="hint">Use password: 1234 and pick any role.</p>
      <form onSubmit={onSubmit} className="stack">
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="e.g. alice"
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            required
          />
        </label>

        <label>
          Role
          <select name="role" value={form.role} onChange={onChange}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
}

export default LoginPage;
