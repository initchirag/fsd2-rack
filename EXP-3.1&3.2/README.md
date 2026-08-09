# Experiment 1.3.1 and 1.3.2 (Simple Working App)

This project is a minimal React app that demonstrates:

- **JWT-style authentication flow** (mock token generation, storage, decode, session restore)
- **RBAC route protection** using roles: `admin`, `editor`, `viewer`
- **Conditional UI rendering** based on role

## Run

```bash
npm install
npm run dev
```

## Login

- Password for demo: `1234`
- Enter any username
- Choose role: `admin`, `editor`, or `viewer`

## What is covered from the experiment brief

### 1.3.1 JWT Authentication

- Login form
- Validate mock credentials
- Generate mock JWT token
- Store token in `localStorage`
- Decode token to restore session
- Attach token to a mock protected API call

### 1.3.2 Role-Based Access Control

- Roles: Admin, Editor, Viewer
- Protected routes with React Router
- Role-restricted pages:
  - `/admin` → admin only
  - `/editor` → admin/editor
  - `/viewer` → all authenticated roles
- Unauthorized users are redirected to `/unauthorized`
- Navbar adapts based on user role
