
# Pipa Blog Engine (pipa)

Lightweight, self-hosted blog engine built with Hono, EJS templates and Sequelize (MySQL). The project is designed to be simple to run and customize — it exposes a small API, server-rendered blog pages and an admin area for creating and managing content.

## Features

- Server-side rendered blog and post pages using EJS templates
- Admin area with login, registration and dashboard
- REST-like controllers for posts, pages, blogs and navigation
- Sequelize ORM for MySQL integration
- RSS feed, robots.txt and favicon generation routes

## Quick start

Requirements

- Node.js (v18+ recommended) — this project uses native ES modules
- MySQL (or compatible) database

Install dependencies

```powershell
npm install
```

Create a `.env` file in the project root (see Environment variables below). Example:

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_DIALECT=mysql
DATABASE_NAME=pipas_db
DATABASE_USER=root
DATABASE_PASSWORD=secret

# Hash / JWT secret used for admin auth
HASH_SECRET=your_hash_secret_here
```

Run in development

```powershell
npm run dev
```

This starts the server (by default on port 3000). The dev script runs `node src/index.js`.

Production / build

The `build` and `start` scripts are present in `package.json` but no explicit bundler is configured. `npm run start` expects a built `dist/index.js` — adjust or compile as needed for your deployment.

## Environment variables

- PORT — HTTP port (defaults to 3000)
- DB_HOST — Database host
- DB_DIALECT — Sequelize dialect (e.g. `mysql`)
- DATABASE_NAME — Database name
- DATABASE_USER — Database user
- DATABASE_PASSWORD — Database password
- HASH_SECRET — Secret used for signing admin JWTs

Make sure the DB user has privileges to create tables. On startup the application calls `sequelize.sync()` to create missing tables.

## Routes and admin area

Public routes (examples)

- / — Root, handled by `RootController`
- /rss.xml — RSS feed
- /robots.txt — Robots file
- /:blogSlug — Blog index pages (posts listing)
- /:blogSlug/:postSlug — Post page
- /:blogSlug/page/:pageSlug — Page page

Admin routes

- GET/POST /admin/login — Admin login
- GET/POST /admin/register — Admin registration
- GET /admin/dashboard — Dashboard (requires JWT cookie)
- GET /admin/create-blog — Create first blog

Authentication

Admin authentication uses a JWT stored in the `admin_jwt_token` cookie. `HASH_SECRET` must be set in the environment for signing and verification.

## Project layout


- `src/` — Application source
  - `index.js` — App entry (Hono server, route registrations)
  - `admin/` — Admin page handlers (Login, Register, Dashboard, CreatePost, CreatePage, CreateBlog)
  - `controllers/` — API controllers (Auth, Blog, Post, Page, Navigation, Register, Root)
  - `helpers/` — DB, models, template rendering, slug generator
  - `middlewares/` — Middlewares (subdomain handling, validators)
  - `pages/` — Blog-facing page handlers (BlogIndex, Post, Page, Rss, Robots, FavIcon)
  - `templates/` — EJS templates for admin and blog pages
  - `static/` — Static assets (CSS, fonts, images, admin JS)

## Templates

Templates are EJS files located under `templates/`. The admin UI and blog UI are separated (`templates/admin` and `templates/blogs`). You can customize layouts and partials (header/footer/menu) to change the site's look.

## Database / Models

Models are defined in `src/helpers/models.js` and wired into Sequelize in `src/helpers/db.js`. On app start the code runs `sequelize.sync({ force: false })` which will create tables if they do not exist.

## Development notes & tips

- Adjust `HASH_SECRET` and use a strong random value for production.
- Consider using a process manager (pm2, systemd) or containerization for production deployments.
- Add migrations if you want more controlled schema changes instead of relying on `sequelize.sync()`.

## Troubleshooting

- If you see database connection errors, confirm environment variables and that MySQL is reachable.
- If templates don't render, double-check the `templates/` path and that files haven't been moved.

## Contributing

Contributions are welcome. Open an issue or submit a pull request with improvements.

