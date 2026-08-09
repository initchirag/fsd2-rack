function AdminPage() {
  return (
    <section className="card">
      <h1>Admin Panel</h1>
      <p>Only users with role <strong>admin</strong> can open this page.</p>
      <ul>
        <li>Manage users</li>
        <li>Access sensitive controls</li>
      </ul>
    </section>
  );
}

export default AdminPage;
