# Urban Mining Connect — Node.js Full Stack

A mobile-first Urban Mining / Secondary Raw Materials prototype with a pure Node.js backend.

## Run

1. Open this folder in VS Code.
2. Open Terminal.
3. Run:

```bash
node server/server.js
```

or:

```bash
npm start
```

4. Open **http://localhost:8000/** in your browser.

No Express, database package, Python, MySQL or SQLite is required. The backend uses Node.js core modules only.

## Accounts

The project now supports two account roles:

- **Collector** — sign up/login, capture material lots, upload photo evidence, view valuation, handover and earnings.
- **Buyer / Recycler** — sign up/login, access the Recovery Partner Console and logout.

Use **Sign up** to create either account type. Passwords are stored as salted `scrypt` hashes in the local JSON database; the plaintext password is never written to the database. Login creates an HTTP-only session cookie. Sessions are held in server memory and therefore end when the Node.js server is restarted.

## Backend storage

The first server start creates:

```text
server/data/db.json
server/data/uploads/
```

`db.json` stores users, lots, handovers and events. Uploaded material photos are stored under `server/data/uploads/` and referenced by the lot record.

## Main API

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Collector

- `GET /api/bootstrap`
- `GET /api/lots`
- `POST /api/lots`
- `GET /api/lots/:id`
- `POST /api/handovers`
- `GET /api/earnings`
- `GET /api/recovery`
- `GET /api/profile`
- `PUT /api/profile`

### Buyer / Recycler

- `GET /api/console`
- `GET /api/export/custody.csv`

### Public reference data

- `GET /api/materials`
- `GET /api/facilities`

## Important

This is a local prototype. Seed material rates, buyer/facility data and authorization labels are illustrative. Authentication is suitable for a local demo, not production deployment without HTTPS, persistent session storage, CSRF protection, rate limiting, account recovery and stronger operational security controls.
