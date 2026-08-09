function EditorPage() {
  return (
    <section className="card">
      <h1>Editor Workspace</h1>
      <p>Users with role <strong>editor</strong> or <strong>admin</strong> can access this page.</p>
      <ul>
        <li>Edit records</li>
        <li>Create new content</li>
      </ul>
    </section>
  );
}

export default EditorPage;
