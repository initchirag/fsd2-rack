import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchUserProfile } from "../services/mockApi";

function DashboardPage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchUserProfile(token)
      .then((data) => {
        if (active) {
          setProfile(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="card">
      <h1>Dashboard</h1>
      <p>This page is protected with token-based auth.</p>

      {error && <p className="error">{error}</p>}
      {!error && !profile && <p>Loading user profile...</p>}

      {profile && (
        <div className="stack">
          <p>{profile.greeting}</p>
          <p>
            <strong>Role:</strong> {profile.role}
          </p>
          <p>
            <strong>Token issued:</strong> {profile.tokenIssuedAt}
          </p>
          <p>
            <strong>Permissions:</strong> {user.permissions.join(", ")}
          </p>
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
