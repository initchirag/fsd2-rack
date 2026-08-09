import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <section className="card">
      <h1>Unauthorized</h1>
      <p>You do not have permission to access that route.</p>
      <Link to="/dashboard">Go back to dashboard</Link>
    </section>
  );
}

export default UnauthorizedPage;
